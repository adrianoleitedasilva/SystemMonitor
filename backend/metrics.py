import psutil
import time

_last_net_io = psutil.net_io_counters()
_last_net_time = time.time()

_last_disk_io = psutil.disk_io_counters()
_last_disk_time = time.time()


def get_cpu():
    freq = psutil.cpu_freq()
    return {
        "percent": psutil.cpu_percent(interval=None),
        "per_core": psutil.cpu_percent(interval=None, percpu=True),
        "freq_mhz": round(freq.current, 1) if freq else None,
        "count_logical": psutil.cpu_count(logical=True),
        "count_physical": psutil.cpu_count(logical=False),
    }


def get_ram():
    mem = psutil.virtual_memory()
    return {
        "total_gb": round(mem.total / 1e9, 2),
        "used_gb": round(mem.used / 1e9, 2),
        "available_gb": round(mem.available / 1e9, 2),
        "percent": mem.percent,
    }


def get_disk():
    global _last_disk_io, _last_disk_time

    now = time.time()
    current_io = psutil.disk_io_counters()
    elapsed = now - _last_disk_time

    read_mb_s = 0.0
    write_mb_s = 0.0
    if elapsed > 0 and _last_disk_io and current_io:
        read_mb_s = round((current_io.read_bytes - _last_disk_io.read_bytes) / elapsed / 1e6, 2)
        write_mb_s = round((current_io.write_bytes - _last_disk_io.write_bytes) / elapsed / 1e6, 2)

    _last_disk_io = current_io
    _last_disk_time = now

    partitions = []
    for p in psutil.disk_partitions(all=False):
        try:
            usage = psutil.disk_usage(p.mountpoint)
            partitions.append({
                "device": p.device,
                "mountpoint": p.mountpoint,
                "total_gb": round(usage.total / 1e9, 2),
                "used_gb": round(usage.used / 1e9, 2),
                "free_gb": round(usage.free / 1e9, 2),
                "percent": usage.percent,
            })
        except PermissionError:
            continue

    return {
        "partitions": partitions,
        "read_mb_s": read_mb_s,
        "write_mb_s": write_mb_s,
    }


def get_network():
    global _last_net_io, _last_net_time

    now = time.time()
    current = psutil.net_io_counters()
    elapsed = now - _last_net_time

    sent_mb_s = 0.0
    recv_mb_s = 0.0
    if elapsed > 0:
        sent_mb_s = round((current.bytes_sent - _last_net_io.bytes_sent) / elapsed / 1e6, 3)
        recv_mb_s = round((current.bytes_recv - _last_net_io.bytes_recv) / elapsed / 1e6, 3)

    _last_net_io = current
    _last_net_time = now

    return {
        "sent_mb_s": sent_mb_s,
        "recv_mb_s": recv_mb_s,
        "total_sent_gb": round(current.bytes_sent / 1e9, 3),
        "total_recv_gb": round(current.bytes_recv / 1e9, 3),
    }


def get_processes(limit=10):
    procs = []
    for p in psutil.process_iter(["pid", "name", "cpu_percent", "memory_info", "status"]):
        try:
            info = p.info
            procs.append({
                "pid": info["pid"],
                "name": info["name"],
                "cpu_percent": info["cpu_percent"] or 0.0,
                "memory_mb": round((info["memory_info"].rss if info["memory_info"] else 0) / 1e6, 1),
                "status": info["status"],
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    procs.sort(key=lambda x: x["cpu_percent"], reverse=True)
    return procs[:limit]


def get_gpu():
    try:
        import GPUtil
        gpus = GPUtil.getGPUs()
        return [
            {
                "name": g.name,
                "load_percent": round(g.load * 100, 1),
                "memory_used_mb": round(g.memoryUsed, 1),
                "memory_total_mb": round(g.memoryTotal, 1),
                "temperature_c": g.temperature,
            }
            for g in gpus
        ]
    except Exception:
        return []


def collect_all():
    return {
        "cpu": get_cpu(),
        "ram": get_ram(),
        "disk": get_disk(),
        "network": get_network(),
        "processes": get_processes(),
        "gpu": get_gpu(),
    }

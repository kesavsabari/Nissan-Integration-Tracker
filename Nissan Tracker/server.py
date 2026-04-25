import http.server
import socketserver
import json
import os
import gzip
import io
import shutil
import time
from datetime import datetime

PORT = 5000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
BACKUP_DIR = os.path.join(DIRECTORY, 'backups')
INTEG_FILE = os.path.join(DIRECTORY, 'integrations.json')
REGIONS_FILE = os.path.join(DIRECTORY, 'regions.json')
STATUSES_FILE = os.path.join(DIRECTORY, 'statuses.json')
HISTORY_FILE = os.path.join(DIRECTORY, 'history.json')

LAST_BACKUP_TIME = 0
BACKUP_THROTTLE = 300 # 5 minutes

def create_backup():
    global LAST_BACKUP_TIME
    now = time.time()
    if now - LAST_BACKUP_TIME < BACKUP_THROTTLE:
        return
    
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
    
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    target = os.path.join(BACKUP_DIR, ts)
    os.makedirs(target)
    
    for f in [INTEG_FILE, REGIONS_FILE, STATUSES_FILE, HISTORY_FILE]:
        if os.path.exists(f):
            shutil.copy(f, target)
    
    LAST_BACKUP_TIME = now
    print(f"Backup created at {ts}")
    
    # Keep only last 10 backups
    backups = sorted([d for d in os.listdir(BACKUP_DIR) if os.path.isdir(os.path.join(BACKUP_DIR, d))])
    while len(backups) > 10:
        oldest = backups.pop(0)
        shutil.rmtree(os.path.join(BACKUP_DIR, oldest))
        print(f"Removed old backup: {oldest}")

class TrackerHandler(http.server.SimpleHTTPRequestHandler):
    def send_compressed_response(self, content, content_type):
        accept_encoding = self.headers.get('Accept-Encoding', '')
        
        if 'gzip' in accept_encoding:
            out = io.BytesIO()
            with gzip.GzipFile(fileobj=out, mode='w') as f:
                f.write(content)
            compressed_content = out.getvalue()
            
            self.send_response(200)
            self.send_header('Content-type', content_type)
            self.send_header('Content-Encoding', 'gzip')
            self.send_header('Content-Length', str(len(compressed_content)))
            self.end_headers()
            self.wfile.write(compressed_content)
        else:
            self.send_response(200)
            self.send_header('Content-type', content_type)
            self.send_header('Content-Length', str(len(content)))
            self.end_headers()
            self.wfile.write(content)

    def load_json(self, path, default):
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return default

    def do_GET(self):
        if self.path == '/api/data':
            data = {
                "integrations": self.load_json(INTEG_FILE, []),
                "regions": self.load_json(REGIONS_FILE, []),
                "statuses": self.load_json(STATUSES_FILE, {}),
                "history": self.load_json(HISTORY_FILE, [])
            }
            content = json.dumps(data).encode('utf-8')
            self.send_compressed_response(content, 'application/json')
        elif self.path in ['/app.js', '/styles.css', '/index.html', '/']:
            filename = self.path[1:] if self.path != '/' else 'index.html'
            content_type = 'text/html'
            if filename.endswith('.js'): content_type = 'application/javascript'
            elif filename.endswith('.css'): content_type = 'text/css'
            
            if os.path.exists(os.path.join(DIRECTORY, filename)):
                with open(os.path.join(DIRECTORY, filename), 'rb') as f:
                    content = f.read()
                self.send_compressed_response(content, content_type)
            else:
                super().do_GET()
        else:
            return super().do_GET()

    def do_POST(self):
        if self.path == '/api/data':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                
                # Auto-backup before save
                create_backup()
                
                # Split and save to respective files
                save_map = {
                    'integrations': INTEG_FILE,
                    'regions': REGIONS_FILE,
                    'statuses': STATUSES_FILE,
                    'history': HISTORY_FILE
                }
                
                for key, filepath in save_map.items():
                    if key in data:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            json.dump(data[key], f, indent=2)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"ok": True}).encode())
            except Exception as e:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(str(e).encode())
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    # Change to the directory where server.py is located to serve files correctly
    os.chdir(DIRECTORY)
    
    with socketserver.TCPServer(("", PORT), TrackerHandler) as httpd:
        print(f"Nissan Integration Tracker running at http://localhost:{PORT}")
        print("100% Zero-Dependency Mode Active (No Flask required)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            httpd.shutdown()

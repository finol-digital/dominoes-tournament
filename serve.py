from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
os.chdir(Path(__file__).resolve().parent)
class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('X-Domino-Night', 'local-tracker-v1')
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
ThreadingHTTPServer(('127.0.0.1',8765),Handler).serve_forever()

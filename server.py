import json
from urllib.parse import unquote, urlparse

import pyautogui
import tornado.ioloop
import tornado.web
import tornado.websocket

def queryMousePosition():
    pos = pyautogui.position()
    return {"x": pos[0], "y": pos[1]}

class WebSocketServer(tornado.websocket.WebSocketHandler):
    client = None
    file_cache = {}

    def check_origin(self, origin):
        return True

    def open(self):
        print("editor connected")
        WebSocketServer.client = self

    def on_close(self):
        print("editor disconnected")
        if WebSocketServer.client is self:
            WebSocketServer.client = None

    @classmethod
    def send_message(cls, message: str):
        if cls.client is not None:
            cls.client.write_message(message)
    
    @classmethod
    def get_file_contents(cls, file, row, col):
        num_chars = 20
        row -= 1
        col -=1
        if file not in cls.file_cache:
            with open(file) as file_handle:
                cls.file_cache[file] = file_handle.readlines()
        file_lines = cls.file_cache[file]
        if row >= len(file_lines):
            return "cursor past end of file"
        elif row < 0:
            return "cursor above editor"
        else:
            line = file_lines[row]
            if col >= len(line):
                return "..."+line[len(line)-num_chars:]
            elif col <= 0:
                return line[:num_chars] + "..."
            else:
                left_bound = max(0, col-num_chars//2)
                right_bound = min(len(line), col+num_chars//2)
                return "..."+line[left_bound:right_bound]+"..."
    
    def on_message(self, message):
        print(message)
        data = json.loads(message)
        if "file" in data and "row" in data and "col" in data:
            file_path = unquote(urlparse(data["file"]).path)[1:]
            print("file preview:")
            print(self.get_file_contents(file_path, data["row"], data["col"]))

def main():
    app = tornado.web.Application([(r"/websocket/", WebSocketServer)])
    app.listen(8888)

    # Create an event loop (what Tornado calls an IOLoop).
    io_loop = tornado.ioloop.IOLoop.current()

    async def queryRowCol():
        pos = queryMousePosition()
        print("querying row/col for mouse coordinates", pos)
        WebSocketServer.send_message(json.dumps(pos))
    
    periodic_query = tornado.ioloop.PeriodicCallback(queryRowCol, 2000.0)
    periodic_query.start()

    # Start the event loop.
    io_loop.start()


if __name__ == "__main__":
    main()

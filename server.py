import asyncio
import json

import pyautogui
import tornado.ioloop
import tornado.web
import tornado.websocket

def queryMousePosition():
    pos = pyautogui.position()
    return {"x": pos[0], "y": pos[1]}

class WebSocketServer(tornado.websocket.WebSocketHandler):
    client = None

    def check_origin(self, origin):
        return True

    def open(self):
        WebSocketServer.client = self

    def on_close(self):
        if WebSocketServer.client is self:
            WebSocketServer.client = None

    @classmethod
    def send_message(cls, message: str):
        if cls.client is not None:
            cls.client.write_message(message)
    
    def on_message(self, message):
        print(message)

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

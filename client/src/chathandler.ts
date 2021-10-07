import { EventEmitter } from "events";
import io, { Socket } from "socket.io-client";

interface IntroductionPacket {
  username: string;
  users: string[];
  time: string;
}

interface ChatState {
  username: string;
  users: string[];
}

interface MessagePacket {
  sender: string;
  content: string;
}

export default class ChatHandler extends EventEmitter {
  private socket: Socket;
  private _state: ChatState | undefined;

  public get state(): ChatState | undefined {
    return this._state;
  }

  private set state(v: ChatState | undefined) {
    this._state = v;
  }

  public get connected(): boolean {
    return this.socket && this.socket.active;
  }

  public get authenticated(): boolean {
    return this.state !== undefined;
  }

  constructor() {
    super();

    this.socket = io("http://127.0.0.1:3001");

    this.socket.on("connect", () => this.emit("reload"));
    this.socket.on("disconnect", () => this.emit("reload"));

    this.socket.on("welcome", (data: IntroductionPacket) => {
      this.state = data;
      this.emit("reload");
    });

    this.socket.on("incorrect-password", () => this.emit("incorrect-password"));

    this.socket.on("chat-message", (data: MessagePacket) => {
      if (this.state) this.emit("chat-message", data);
    });

    this.socket.on("announcement", content => this.emit("announcement", content))
  }

  requestLogin(username: string, password: string) {
    this.socket.emit("login-request", { username, password });
  }

  sendMessage(content: string) {
    this.socket.emit("chat-message", content);
  }
}

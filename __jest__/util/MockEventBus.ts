import {MockSubscription} from './MockSubscription';

export class MockEventBus<Events extends Record<string, unknown>> {
  private _listeners: {[name in keyof Events]?: ((event: Events[name]) => unknown)[]} = {};

  public addEventListener<E extends keyof Events>(event: E, listener: (event: Events[E]) => unknown) {
    const listener1 = this._listeners[event];
    if (listener1) {
      listener1.push(listener);
    } else {
      this._listeners[event] = [listener];
    }
    return new MockSubscription(() => {
      this._listeners[event] = this._listeners[event]?.filter(l => l !== listener);
    });
  }

  public emit<E extends keyof Events>(event: E, data: Events[E]) {
    this._listeners[event]?.forEach(listener => listener(data));
  }

  public clear() {
    this._listeners = {};
  }

  public get listeners() {
    return this._listeners;
  }
}

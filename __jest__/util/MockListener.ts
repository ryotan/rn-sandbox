import {MockSubscription} from './MockSubscription';

export class MockListener<Events> {
  private _listeners: ((event: Events) => unknown)[] = [];

  public addEventListener(listener: (event: Events) => unknown) {
    this._listeners.push(listener);
    return new MockSubscription(() => {
      this._listeners = this._listeners?.filter(l => l !== listener);
    });
  }

  public emit(event: Events) {
    this._listeners.forEach(listener => listener(event));
  }

  public clear() {
    this._listeners = [];
  }

  public get listeners() {
    return this._listeners;
  }
}

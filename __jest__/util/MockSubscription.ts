export class MockSubscription extends Function {
  constructor(private readonly _onUnsubscribe: () => void) {
    super();
    return new Proxy(this, {
      apply: target => target.remove(),
    });
  }

  remove(): void {
    this._onUnsubscribe();
  }
}

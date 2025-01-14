'use strict';

// This script depends on the following scripts:
//    /fs/resources/messaging-helpers.js
//    /service-worker/resources/test-helpers.sub.js

promise_test(async t => {
  function dummyCallback(records, observer) {};
  try {
    const observer = new FileSystemObserver(dummyCallback);
  } catch (error) {
    assert_unreached();
  }
}, 'Creating a FileSystemObserver from a window succeeds');

promise_test(async t => {
  const dedicated_worker =
      create_dedicated_worker(t, kDedicatedWorkerMessageTarget);
  dedicated_worker.postMessage({type: 'create-file-system-observer'});

  const event_watcher = new EventWatcher(t, dedicated_worker, 'message');
  const message_event = await event_watcher.wait_for('message');
  const response = message_event.data;

  assert_true(response.createObserverSuccess);
}, 'Creating a FileSystemObserver from a dedicated worker succeeds');

if (self.SharedWorker !== undefined) {
  promise_test(async t => {
    const shared_worker = new SharedWorker(kSharedWorkerMessageTarget);
    shared_worker.port.start();
    shared_worker.port.postMessage({type: 'create-file-system-observer'});

    const event_watcher = new EventWatcher(t, shared_worker.port, 'message');
    const message_event = await event_watcher.wait_for('message');
    const response = message_event.data;

    assert_true(response.createObserverSuccess);
  }, 'Creating a FileSystemObserver from a shared worker succeeds');
}

promise_test(async t => {
  const scope = `${kServiceWorkerMessageTarget}?create-observer`;
  const registration =
      await create_service_worker(t, kServiceWorkerMessageTarget, scope);
  await wait_for_state(t, registration.installing, 'activated');

  registration.active.postMessage({type: 'create-file-system-observer'});

  const event_watcher = new EventWatcher(t, navigator.serviceWorker, 'message');
  const message_event = await event_watcher.wait_for('message');
  const response = message_event.data;

  assert_false(response.createObserverSuccess);
}, 'Creating a FileSystemObserver from a service worker fails');

directory_test(async (t, root_dir) => {
  function dummyCallback(records, observer) {};
  const observer = new FileSystemObserver(dummyCallback);
  try {
    observer.unobserve(root_dir);
  } catch (error) {
    assert_unreached();
  }
}, 'Calling unobserve() without a corresponding observe() shouldn\t throw');

directory_test(async (t, root_dir) => {
  function dummyCallback(records, observer) {};
  const observer = new FileSystemObserver(dummyCallback);
  try {
    observer.unobserve(root_dir);
    observer.unobserve(root_dir);
  } catch (error) {
    assert_unreached();
  }
}, 'unobserve() is idempotent');

promise_test(async t => {
  function dummyCallback(records, observer) {};
  const observer = new FileSystemObserver(dummyCallback);
  try {
    observer.disconnect();
  } catch (error) {
    assert_unreached();
  }
}, 'Calling disconnect() without observing shouldn\'t throw');

promise_test(async t => {
  function dummyCallback(records, observer) {};
  const observer = new FileSystemObserver(dummyCallback);
  try {
    observer.disconnect();
    observer.disconnect();
  } catch (error) {
    assert_unreached();
  }
}, 'disconnect() is idempotent');

import { Changeset, EmberChangeset } from 'ember-changeset';
import EmberObject, { get } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

// Like a WarpDrive schema record: reading a string key outside its schema
// throws, while symbol reads and `in` answer without throwing.
function strictRecord(fields) {
  return new Proxy(fields, {
    get(target, prop) {
      if (typeof prop === 'symbol' || prop in target) {
        return Reflect.get(target, prop);
      }
      throw new Error(`No field named ${String(prop)} on page`);
    },
  });
}

module('Unit | strict content', function (hooks) {
  setupTest(hooks);

  test('Ember get reads a strict record field that has no value yet', function (assert) {
    const dummy = Changeset(strictRecord({ title: undefined }));

    assert.strictEqual(get(dummy, 'title'), undefined);
  });

  test('sets a strict record field', function (assert) {
    const dummy = Changeset(strictRecord({ title: 'About' }));

    dummy.set('title', 'Contact');

    assert.strictEqual(dummy.get('title'), 'Contact');
  });

  test('reads a key an ObjectProxy forwards to its content', function (assert) {
    const dummy = Changeset(
      ObjectProxy.create({ content: { title: 'About' } }),
    );

    assert.strictEqual(get(dummy, 'title'), 'About');
    assert.strictEqual(dummy.get('title'), 'About');
    assert.strictEqual(dummy.title, 'About');
  });

  test('reads a key through the content’s own unknownProperty', function (assert) {
    class Content extends EmberObject {
      unknownProperty(key) {
        return `unknown:${key}`;
      }
    }
    const dummy = Changeset(Content.create());

    assert.strictEqual(get(dummy, 'title'), 'unknown:title');
    assert.strictEqual(dummy.get('title'), 'unknown:title');
    assert.strictEqual(dummy.title, 'unknown:title');
  });

  test('safeGet reads a key off a primitive', function (assert) {
    const dummy = new EmberChangeset({});

    assert.strictEqual(dummy.safeGet('About', 'length'), 5);
  });
});

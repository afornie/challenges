package lru;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.function.Supplier;
import org.junit.jupiter.api.Test;

class LRUTest {

  @Test
  void lruLinkedHashMapImplementationBehavesAsExpected() {
    runCommonTests(() -> new LruCacheAdapter<>(new LRU<>(2)));
  }

  @Test
  void lruManualImplementationBehavesAsExpected() {
    runCommonTests(() -> new LruCacheAdapter<>(new ManualLRU<>(2)));
  }

  @Test
  void rejectsNonPositiveCapacity() {
    assertThatThrownBy(() -> new LRU<>(0)).isInstanceOf(IllegalArgumentException.class);
    assertThatThrownBy(() -> new ManualLRU<>(-1)).isInstanceOf(IllegalArgumentException.class);
  }

  private void runCommonTests(Supplier<Cache<String, String>> factory) {
    shouldPutAndGet(factory);
    shouldEvictLeastRecentlyUsed(factory);
    getShouldRefreshRecency(factory);
    updateShouldRefreshRecency(factory);
  }

  private void shouldPutAndGet(Supplier<Cache<String, String>> factory) {
    Cache<String, String> cache = factory.get();
    cache.put("a", "1");
    cache.put("b", "2");

    assertThat(cache.size()).isEqualTo(2);
    assertThat(cache.get("a")).isEqualTo("1");
    assertThat(cache.get("b")).isEqualTo("2");
    assertThat(cache.get("missing")).isNull();
  }

  private void shouldEvictLeastRecentlyUsed(Supplier<Cache<String, String>> factory) {
    Cache<String, String> cache = factory.get();
    cache.put("a", "1"); // MRU: a
    cache.put("b", "2"); // MRU: b, LRU: a
    cache.put("c", "3"); // evict a

    assertThat(cache.get("a")).isNull();
    assertThat(cache.get("b")).isEqualTo("2");
    assertThat(cache.get("c")).isEqualTo("3");
  }

  private void getShouldRefreshRecency(Supplier<Cache<String, String>> factory) {
    Cache<String, String> cache = factory.get();
    cache.put("a", "1");
    cache.put("b", "2");
    cache.get("a"); // a becomes MRU, b becomes LRU
    cache.put("c", "3"); // evict b

    assertThat(cache.get("a")).isEqualTo("1");
    assertThat(cache.get("b")).isNull();
    assertThat(cache.get("c")).isEqualTo("3");
  }

  private void updateShouldRefreshRecency(Supplier<Cache<String, String>> factory) {
    Cache<String, String> cache = factory.get();
    cache.put("a", "1");
    cache.put("b", "2");
    cache.put("a", "updated"); // a becomes MRU
    cache.put("c", "3"); // should evict b, not a

    assertThat(cache.get("a")).isEqualTo("updated");
    assertThat(cache.get("b")).isNull();
    assertThat(cache.get("c")).isEqualTo("3");
  }

  @Test
  void capacityOneEvictionLinkedHashMapImpl() {
    Cache<String, String> cache = new LruCacheAdapter<>(new LRU<>(1));
    cache.put("a", "1");
    cache.put("b", "2"); // evict a

    assertThat(cache.size()).isEqualTo(1);
    assertThat(cache.get("a")).isNull();
    assertThat(cache.get("b")).isEqualTo("2");
  }

  @Test
  void capacityOneEvictionManualImpl() {
    Cache<String, String> cache = new LruCacheAdapter<>(new ManualLRU<>(1));
    cache.put("a", "1");
    cache.put("b", "2"); // evict a

    assertThat(cache.size()).isEqualTo(1);
    assertThat(cache.get("a")).isNull();
    assertThat(cache.get("b")).isEqualTo("2");
  }

  private interface Cache<K, V> {
    V get(K key);

    void put(K key, V value);

    int size();
  }

  private static class LruCacheAdapter<K, V> implements Cache<K, V> {
    private final Object delegate;

    LruCacheAdapter(Object delegate) {
      this.delegate = delegate;
    }

    @SuppressWarnings("unchecked")
    @Override
    public V get(K key) {
      if (delegate instanceof LRU) {
        return ((LRU<K, V>) delegate).get(key);
      }
      return ((ManualLRU<K, V>) delegate).get(key);
    }

    @SuppressWarnings("unchecked")
    @Override
    public void put(K key, V value) {
      if (delegate instanceof LRU) {
        ((LRU<K, V>) delegate).put(key, value);
      } else {
        ((ManualLRU<K, V>) delegate).put(key, value);
      }
    }

    @SuppressWarnings("unchecked")
    @Override
    public int size() {
      if (delegate instanceof LRU) {
        return ((LRU<K, V>) delegate).size();
      }
      return ((ManualLRU<K, V>) delegate).size();
    }
  }
}

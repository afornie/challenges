package lru;

import java.util.LinkedHashMap;
import java.util.Map;

public class LRU<K, V> {

  private final int capacity;
  private final Map<K, V> cache;

  public LRU(int capacity) {
    if (capacity <= 0) {
      throw new IllegalArgumentException("Capacity must be greater than zero");
    }
    this.capacity = capacity;
    this.cache =
        new LinkedHashMap<>(capacity, 0.75f, true) {
          @Override
          protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
            return size() > LRU.this.capacity;
          }
        };
  }

  public V get(K key) {
    return cache.get(key);
  }

  public void put(K key, V value) {
    cache.put(key, value);
  }

  public int size() {
    return cache.size();
  }
}

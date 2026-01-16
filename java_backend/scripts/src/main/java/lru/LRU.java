package lru;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public class LRU<K, V> {
    // Make an inner class that holds the timestamp and the value of type T
    class Track {
        Instant time;
        K key;
    }

    protected int capacity;
    protected List<Track> list;
    protected Map<K, V> contentsMap;
    protected Map<K, Track> tracksMap;

    public LRU(int capacity) {
        this.capacity = capacity;
        list = new java.util.ArrayList<>();
    }

    public V get(K key) {
        sort();
        return contentsMap.get(key);
    }

    public void put(K key, V value) {
        contentsMap.put(key, value);
    }
    protected void sort() {
        
    }
}

package lru;

import java.util.HashMap;
import java.util.Map;

/**
 * Manual LRU implementation using a HashMap plus a doubly linked list to track recency.
 */
public class ManualLRU<K, V> {

  private final int capacity;
  private final Map<K, Node<K, V>> index = new HashMap<>();
  private final Node<K, V> head; // most recently used sentinel
  private final Node<K, V> tail; // least recently used sentinel

  public ManualLRU(int capacity) {
    if (capacity <= 0) {
      throw new IllegalArgumentException("Capacity must be greater than zero");
    }
    this.capacity = capacity;
    head = new Node<>(null, null);
    tail = new Node<>(null, null);
    head.next = tail;
    tail.prev = head;
  }

  public V get(K key) {
    Node<K, V> node = index.get(key);
    if (node == null) {
      return null;
    }
    moveToFront(node);
    return node.value;
  }

  public void put(K key, V value) {
    Node<K, V> existing = index.get(key);
    if (existing != null) {
      existing.value = value;
      moveToFront(existing);
      return;
    }

    Node<K, V> node = new Node<>(key, value);
    index.put(key, node);
    addToFront(node);

    if (index.size() > capacity) {
      evictLeastRecentlyUsed();
    }
  }

  public int size() {
    return index.size();
  }

  private void evictLeastRecentlyUsed() {
    Node<K, V> lru = tail.prev;
    if (lru != null && lru != head) {
      remove(lru);
      index.remove(lru.key);
    }
  }

  private void moveToFront(Node<K, V> node) {
    remove(node);
    addToFront(node);
  }

  private void addToFront(Node<K, V> node) {
    node.next = head.next;
    node.prev = head;
    head.next.prev = node;
    head.next = node;
  }

  private void remove(Node<K, V> node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  private static class Node<K, V> {
    K key;
    V value;
    Node<K, V> prev;
    Node<K, V> next;

    Node(K key, V value) {
      this.key = key;
      this.value = value;
    }
  }
}

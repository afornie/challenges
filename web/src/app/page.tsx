"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";

type Todo = {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
};

const DEFAULT_API = "http://localhost:3001";

export default function Home() {
  const apiBase = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE ?? DEFAULT_API,
    [],
  );

  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/todos`);
      if (!res.ok) {
        throw new Error(`Failed to load todos (${res.status})`);
      }
      const data: Todo[] = await res.json();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);
    try {
      const res = await fetch(`${apiBase}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined }),
      });
      if (!res.ok) {
        throw new Error(`Failed to create todo (${res.status})`);
      }
      setTitle("");
      setDescription("");
      await loadTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleToggle = async (todo: Todo) => {
    setError(null);
    try {
      const res = await fetch(`${apiBase}/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!res.ok) {
        throw new Error(`Failed to update todo (${res.status})`);
      }
      await loadTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`${apiBase}/todos/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error(`Failed to delete todo (${res.status})`);
      }
      await loadTodos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.badge}>Nest + Next</p>
          <h1>Todos</h1>
          <p className={styles.subtitle}>Simple CRUD hitting the Nest API.</p>
        </div>
        <div className={styles.status}>
          <span className={styles.dot} data-state={loading ? "on" : "off"} />
          <span>{loading ? "Loading..." : "Idle"}</span>
        </div>
      </header>

      <form className={styles.form} onSubmit={handleAdd}>
        <div className={styles.fields}>
          <input
            className={styles.input}
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            className={styles.input}
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit" className={styles.button}>
          Add todo
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      <section className={styles.list}>
        {todos.length === 0 && !loading ? (
          <p className={styles.empty}>No todos yet. Add one above.</p>
        ) : (
          todos.map((todo) => (
            <article key={todo.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggle(todo)}
                  />
                  <span className={styles.checkLabel}>
                    <span className={todo.completed ? styles.done : ""}>
                      {todo.title}
                    </span>
                    {todo.description && (
                      <small className={styles.description}>
                        {todo.description}
                      </small>
                    )}
                  </span>
                </label>
                <button
                  className={styles.delete}
                  onClick={() => handleDelete(todo.id)}
                  aria-label={`Delete ${todo.title}`}
                >
                  ✕
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

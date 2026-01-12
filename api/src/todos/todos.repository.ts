export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
}

export interface TodosRepository {
  findAll(): Todo[];
  findOne(id: number): Todo | undefined;
  create(data: { title: string; description?: string }): Todo;
  update(id: number, data: Partial<Omit<Todo, 'id'>>): Todo;
  remove(id: number): void;
}

export class InMemoryTodosRepository implements TodosRepository {
  private todos: Todo[] = [];
  private idCounter = 1;

  findAll(): Todo[] {
    return this.todos;
  }

  findOne(id: number): Todo | undefined {
    return this.todos.find((item) => item.id === id);
  }

  create(data: { title: string; description?: string }): Todo {
    const todo: Todo = {
      id: this.idCounter++,
      title: data.title,
      description: data.description,
      completed: false,
    };
    this.todos.push(todo);
    return todo;
  }

  update(id: number, data: Partial<Omit<Todo, 'id'>>): Todo {
    const todo = this.findOne(id);
    if (!todo) {
      throw new Error('Not found');
    }
    Object.assign(todo, data);
    return todo;
  }

  remove(id: number): void {
    const index = this.todos.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.todos.splice(index, 1);
    }
  }
}

export const TODOS_REPOSITORY = Symbol('TODOS_REPOSITORY');

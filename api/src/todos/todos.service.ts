import { Injectable, NotFoundException } from '@nestjs/common';

export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
}

export interface CreateTodoDto {
  title: string;
  description?: string;
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  completed?: boolean;
}

@Injectable()
export class TodosService {
  private todos: Todo[] = [];
  private idCounter = 1;

  findAll(): Todo[] {
    return this.todos;
  }

  findOne(id: number): Todo {
    const todo = this.todos.find((item) => item.id === id);
    if (!todo) {
      throw new NotFoundException(`Todo ${id} not found`);
    }
    return todo;
  }

  create(payload: CreateTodoDto): Todo {
    const todo: Todo = {
      id: this.idCounter++,
      title: payload.title,
      description: payload.description,
      completed: false,
    };
    this.todos.push(todo);
    return todo;
  }

  update(id: number, payload: UpdateTodoDto): Todo {
    const todo = this.findOne(id);
    if (payload.title !== undefined) {
      todo.title = payload.title;
    }
    if (payload.description !== undefined) {
      todo.description = payload.description;
    }
    if (payload.completed !== undefined) {
      todo.completed = payload.completed;
    }
    return todo;
  }

  remove(id: number): void {
    const index = this.todos.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException(`Todo ${id} not found`);
    }
    this.todos.splice(index, 1);
  }
}

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateTodoDto } from './dto/create-todo.dto';
import type { UpdateTodoDto } from './dto/update-todo.dto';
import {
  TODOS_REPOSITORY,
  type Todo,
  type TodosRepository,
} from './todos.repository';

@Injectable()
export class TodosService {
  constructor(
    @Inject(TODOS_REPOSITORY)
    private readonly todosRepository: TodosRepository,
  ) {}

  findAll(): Todo[] {
    return this.todosRepository.findAll();
  }

  findOne(id: number): Todo {
    const todo = this.todosRepository.findOne(id);
    if (!todo) {
      throw new NotFoundException(`Todo ${id} not found`);
    }
    return todo;
  }

  create(payload: CreateTodoDto): Todo {
    return this.todosRepository.create({
      title: payload.title,
      description: payload.description,
    });
  }

  update(id: number, payload: UpdateTodoDto): Todo {
    this.findOne(id);
    return this.todosRepository.update(id, payload);
  }

  remove(id: number): void {
    const todo = this.todosRepository.findOne(id);
    if (!todo) {
      throw new NotFoundException(`Todo ${id} not found`);
    }
    this.todosRepository.remove(id);
  }
}

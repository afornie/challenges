import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateTodoDto, Todo, TodosService, UpdateTodoDto } from './todos.service';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  findAll(): Todo[] {
    return this.todosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Todo {
    return this.todosService.findOne(Number(id));
  }

  @Post()
  create(@Body() body: CreateTodoDto): Todo {
    return this.todosService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateTodoDto): Todo {
    return this.todosService.update(Number(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string): void {
    return this.todosService.remove(Number(id));
  }
}

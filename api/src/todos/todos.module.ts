import { Module } from '@nestjs/common';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import {
  InMemoryTodosRepository,
  TODOS_REPOSITORY,
} from './todos.repository';

@Module({
  controllers: [TodosController],
  providers: [
    TodosService,
    {
      provide: TODOS_REPOSITORY,
      useClass: InMemoryTodosRepository,
    },
  ],
})
export class TodosModule {}

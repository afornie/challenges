import { Test } from '@nestjs/testing';
import { TodosService } from '../src/todos/todos.service';
import {
  InMemoryTodosRepository,
  TODOS_REPOSITORY,
  type TodosRepository,
} from '../src/todos/todos.repository';

describe('TodosService', () => {
  let service: TodosService;
  let repo: TodosRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: TODOS_REPOSITORY,
          useClass: InMemoryTodosRepository,
        },
      ],
    }).compile();

    service = moduleRef.get(TodosService);
    repo = moduleRef.get(TODOS_REPOSITORY);
  });

  it('creates and lists todos', () => {
    service.create({ title: 'a' });
    service.create({ title: 'b', description: 'desc' });
    const all = service.findAll();
    expect(all).toHaveLength(2);
    expect(all[0]).toMatchObject({ title: 'a', completed: false });
    expect(all[1]).toMatchObject({ title: 'b', description: 'desc' });
  });

  it('updates a todo', () => {
    const created = service.create({ title: 'a' });
    const updated = service.update(created.id, { completed: true, title: 'x' });
    expect(updated.completed).toBe(true);
    expect(updated.title).toBe('x');
  });

  it('removes a todo', () => {
    const created = service.create({ title: 'a' });
    service.remove(created.id);
    expect(() => service.findOne(created.id)).toThrow();
  });
});

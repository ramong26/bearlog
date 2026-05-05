'use client';
import { useQuery } from '@tanstack/react-query';

import DetailTodoModalComponents from './DetailTodoModalComponents';

import { todoQueries } from '@/shared/lib/query/queryKeys';
import { memo } from 'react';

interface DetailTodoModalProps {
  todoId: number;
}
function DetailTodoModal({ todoId }: DetailTodoModalProps) {
  const { data: todo } = useQuery({
    ...todoQueries.detail(todoId),
    enabled: !!todoId,
  });

  return <DetailTodoModalComponents todo={todo} />;
}

export default memo(DetailTodoModal);

import { motion } from 'framer-motion';
import { useState } from 'react';

import TaskCard from '@/shared/components/TaskCard';

import { ApiError, TodoResponse } from '@/shared/lib/api';
import { usePatchTodo, usePatchTodoFavorite } from '@/shared/lib/query/mutations';
import { useToastStore } from '@/shared/stores/useToastStore';
import { useLanguage } from '@/shared/contexts/LanguageContext';

export default function TaskCardWrapper({ item, mode }: { item: TodoResponse; mode: 'todo' | 'done' }) {
  const { showToast } = useToastStore();
  const { t } = useLanguage();

  // 할 일 상태 업데이트를 위한 mutation 훅
  const patchTodo = usePatchTodo(item.id);
  const handleCheckboxClick = async () => {
    if (item?.id === undefined) return;

    // GitHub 연동 todo는 완료 후 되돌리기 불가 — 백엔드는 source를 "github"(소문자)로 반환
    const isGithubTodo = item.source === 'github';
    if (isGithubTodo && item.done) return;

    try {
      await patchTodo.mutateAsync({
        done: !item.done,
      });
      if (!item.done) {
        if (isGithubTodo) {
          const githubMessage =
            item.type === 'ISSUE'
              ? '할 일을 완료했습니다. GitHub Issue가 close됩니다.'
              : '할 일을 완료했습니다. GitHub PR이 merge됩니다.';
          showToast(githubMessage);
        } else {
          showToast(t.mutations.todoCompleted);
        }
      } else {
        showToast(t.mutations.todoUncompleted);
      }
    } catch (error) {
      if (isGithubTodo && !item.done) {
        const message =
          error instanceof ApiError
            ? error.message
            : item.type === 'ISSUE'
              ? 'GitHub Issue close에 실패했습니다. 잠시 후 다시 시도해주세요.'
              : 'GitHub PR merge에 실패했습니다. 잠시 후 다시 시도해주세요.';
        showToast(message, 'fail');
      } else {
        showToast('할 일 상태 업데이트에 실패했습니다.', 'fail');
      }
      console.error('할 일 상태 업데이트 실패:', error);
    }
  };

  // 할 일 즐겨찾기 토글을 위한 mutation 훅
  const [starred, setStarred] = useState(item?.favorite ?? false);
  const { mutate: patchTodoFavorite } = usePatchTodoFavorite(item?.id);

  const handleStarToggle = () => {
    const nextStarred = !starred;
    setStarred(nextStarred);

    patchTodoFavorite(undefined, {
      onSuccess: () => {
        showToast(nextStarred ? t.mutations.favoriteAdded : t.mutations.favoriteRemoved);
      },
      onError: (error) => {
        console.error(error);
        setStarred(!nextStarred);
      },
    });
  };

  if (!item) return null;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{
        duration: 0.24,
        ease: [0.22, 1, 0.36, 1],
        layout: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      <TaskCard
        variant={mode === 'todo' ? 'green' : 'default'}
        todo={item}
        onCheckboxClick={handleCheckboxClick}
        onStareClick={handleStarToggle}
      />
    </motion.div>
  );
}

import React, { FC, useEffect, useState } from 'react';
import { InitialScreen, TaskVerification } from './components';

const SidePanel: FC = () => {
  const [hasTask, setHasTask] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if there's a task in storage on mount
    chrome.storage.local.get(['task'], (data) => {
      setHasTask(!!data.task);
    });

    // Listen for storage changes to detect when a task is added
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local' && 'task' in changes) {
        setHasTask(!!changes.task.newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Show nothing while checking storage
  if (hasTask === null) {
    return null;
  }

  // Show TaskVerification if there's a task, otherwise InitialScreen
  if (hasTask) {
    return <TaskVerification />;
  }

  return <InitialScreen />;
};

export default SidePanel;

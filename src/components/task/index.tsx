import React, { FC } from 'react';
import { TProps } from './types';
import { Value } from './styled-components';
import { TaskContainer } from '../../components';
import Button from '../button';
import manager from '../../manager';
import configs from '../../configs';
import browser from 'webextension-polyfill';
import { Icons, Tag } from '../../components';
import getStorage from '../../db-storage';
import { TNotarizationGroup,TVerificationStatus } from '../../common/types';
import { defineTaskPointsRange } from '../../common/utils';

const defineTaskContent = (
  status: TVerificationStatus,
  groups: TNotarizationGroup[],
  taskIndex: number,
) => {
  switch (status) {
    case 'default':
      const points = defineTaskPointsRange(groups);
      return (
        <>
          <Tag status="info">+{points}</Tag>
          <Button
            appearance="action"
            size="small"
            onClick={async () => {
              const [tab] = await browser.tabs.query({
                active: true,
                currentWindow: true,
              });

              const storage = await getStorage();
              const userKey = await storage.getUserKey();
              if (!userKey) {
                chrome.tabs.create({
                  url: configs.CONNECT_WALLET_URL,
                });

                return;
              }

             

              chrome.storage.local.set(
                { task: taskIndex },
                async () => {
                  // @ts-ignore
                  chrome.sidePanel.open({
                    tabId: tab.id,
                  });
                  await manager.runTask(taskIndex, userKey);
                },
              );

              setTimeout(() => {
                window.close();
              }, 1500);
            }}
          >
            Verify
          </Button>
        </>
      );
    case 'pending':
    case 'scheduled':
      return <Icons.Clock />;

    default:
      return <Icons.Check />;
  }
};

const Task: FC<TProps> = ({
  title,
  groups,
  icon,
  description,
  status,
  id,
  taskIndex,
}) => {
  const content = defineTaskContent(status, groups, taskIndex);

  return (
    <TaskContainer
      status={status}
      selectable={false}
      title={title}
      description={description}
      icon={icon}
      id={id}
      groups={groups}
    >
      <Value>{content}</Value>
    </TaskContainer>
  );
};

export default Task;

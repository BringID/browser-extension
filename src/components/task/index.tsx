import React, { FC } from 'react';
import { TProps } from './types';
import { Value } from './styled-components';
import { TVerificationStatus } from '../../popup/types';
import { TaskContainer } from '../../components';
import Button from '../button';
import manager from '../../popup/manager';
import configs from '../../popup/configs';
import browser from 'webextension-polyfill';
import { Icons, Tag } from '../../components';
import getStorage from '../../popup/db-storage';
import { TNotarizationGroup } from '../../common/types';
import { defineTaskPointsRange } from '../../popup/utils';

const defineTaskContent = (
  status: TVerificationStatus,
  groups: TNotarizationGroup[],
  taskIndex: number,
) => {
  switch (status) {
    case 'default':
      const points = defineTaskPointsRange(groups)
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

              // @ts-ignore
              chrome.sidePanel.open({
                tabId: tab.id,
              });

              await manager.runTask(taskIndex);
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
  taskIndex
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

import React, { FC, useEffect, useState } from 'react';
import { TProps } from './types';
import { Value } from './styled-components';
import { TVerificationStatus } from '../../popup/types';
import { TaskContainer } from '../../components';
import Button from '../button';
import manager from '../../popup/manager';
import semaphore from '../../popup/semaphore';
import configs from '../../popup/configs';
import browser from 'webextension-polyfill';
import { Icons, Tag } from '../../components';
import getStorage from '../../popup/db-storage';

const definePluginContent = (
  status: TVerificationStatus,
  points: number,
  credentialGroupId: string
) => {
  switch (status) {
    case 'default':
      return <>
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

            await manager.runTask(credentialGroupId);
      
          }}
        >
          Verify
        </Button>
      </>
    case 'pending':
    case 'scheduled':
      return <Icons.Clock />

    default:
      return <Icons.Check />
  }
}



// const defineVerificationStatus = (
//   task?: TTask
// ) => {
//   if (!task || !config) {
//     return {
//       status: 'default',
//       data: null
//     }
//   }

//   if (task) {
//     if (task.scheduledTime > +new Date()) {
//       return {
//         status: 'scheduled',
//         data: task.scheduledTime
//       }
//     } else {
//       return {
//         status: 'completed',
//         data: task.scheduledTime
//       }
//     }
//   } else {
//     return {
//       status: "default",
//       data: null
//     }
//   }
// }

const Task: FC<TProps> = ({
  title,
  credentialGroupId,
  points,
  icon,
  description,
  status
}) => {


  const content = definePluginContent(
    status,
    points,
    credentialGroupId
  )

  return (
    <TaskContainer
      status={status}
      selectable={false}
      title={title}
      description={description}
      icon={icon}
      credentialGroupId={credentialGroupId}
    >
      <Value>
        {content}
      </Value>
    </TaskContainer>
  );
};

export default Task;

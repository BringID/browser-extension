import React, { FC, useEffect, useState } from 'react';
import { TProps } from './types';
import { Value } from './styled-components';
import { TVerificationStatus } from '../../popup/types';
import { TaskContainer } from '../../components';
import { Icons } from '../../components';
import { Button } from '../../components';
import { msToTime, defineExplorerURL } from '../../popup/utils';
import { Tag } from '../../components';
import { useDispatch } from 'react-redux';
import getStorage from '../../popup/db-storage';
import relayer from '../../popup/relayer';

const definePluginContent = (
  status: TVerificationStatus,
  points: number,
  expiration: null | number,
  fetched: boolean,
  onCheckTransactionClick?: () => void,
) => {
  switch (status) {
    case 'default':
      return <Tag status="default">{points} pts</Tag>;
    case 'pending':
      return <Icons.Clock />;
    case 'scheduled':
      return (
        <>
          <Icons.Clock />
          {msToTime(expiration || 0)} left
        </>
      );

    case 'completed':
      if (fetched) {
        return null;
      }
      return (
        <Button onClick={onCheckTransactionClick} size="small">
          Check TX
        </Button>
      );

    default:
      return <Icons.Check />;
  }
};

const Verification: FC<TProps> = ({
  title,
  taskId,
  points,
  icon,
  description,
  scheduledTime,
  status,
  selectable,
  selected,
  onSelect,
  credentialGroupId,
  fetched,
}) => {
  const [expiration, setExpiration] = useState<number | null>(null);

  // useEffect(() => {
  //   if (!taskId) return;

  //   const interval = window.setInterval(async () => {
  //     const now = +new Date();
  //     const expiration = scheduledTime - now;
  //     setExpiration(expiration);
  //     if (expiration <= 0) {
  //       window.clearInterval(interval);
  //       const storage = await getStorage();
  //       await storage.updateVerificationStatus(credentialGroupId, 'completed');
  //     }
  //   }, 1000);

  //   return () => {
  //     window.clearInterval(interval);
  //   };
  // }, []);

  const content = definePluginContent(
    status as TVerificationStatus,
    points,
    expiration,
    fetched,
    async () => {
      if (!taskId) {
        return alert('taskId not defined');
      }
      const verification = await relayer.getVerification(taskId);

      if (verification) {
        const { txHash } = verification;

        chrome.tabs.create({
          url: `${defineExplorerURL(84532)}/tx/${txHash}`,
        });
      }
    },
  );

  return (
    <TaskContainer
      status={status}
      selectable={selectable}
      title={title}
      description={description}
      icon={icon}
      selected={selected}
      onSelect={onSelect}
      credentialGroupId={credentialGroupId}
    >
      <Value>{content}</Value>
    </TaskContainer>
  );
};

export default Verification;

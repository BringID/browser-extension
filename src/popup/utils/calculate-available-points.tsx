import { ethers } from 'ethers'
import { tasks } from '../../common/core'
import { TVerification } from '../types'

function calculateAvailablePoints(verifications: TVerification[]): number {
  let points: number = 0
  const availableTasks = tasks()
  verifications.forEach((verification, idx) => {
    const taskIdx = verification.credentialGroupId
    const relatedTask = availableTasks[Number(taskIdx) - 1]
    points = points + relatedTask.points
  })
  return points
}

export default calculateAvailablePoints

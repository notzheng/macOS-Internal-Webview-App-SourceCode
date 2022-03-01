import {
  exit,
  createChildAccount,
  EndSheetOptions,
  createInviteAndOpenSharingWithContext,
} from '@src/v1/lib/mac-bridge'
import Api, { FamilyDetails } from './api'
import { NativeSheetProps } from '@src/v1/components/native-sheet'
import { logger } from './logger'

export const startAddMemberFlow = async ({
  api,
  familyData,
  inviteRecipients,
}: {
  api: Api
  familyData: FamilyDetails
  inviteRecipients?: string[]
}): Promise<NativeSheetProps | undefined> => {
  try {
    const {
      sharingResult,
      buildInviteResult,
    } = await createInviteAndOpenSharingWithContext(api, inviteRecipients)
    const { transportMode, completionStatus } = sharingResult
    const { inviteCode } = buildInviteResult
    if (completionStatus !== 'cancelled') {
      if (transportMode === 'inviteInPerson') {
        return {
          appFolder: 'add-member-flow',
          windowProps: {
            isInviteInPerson: true,
            familyData,
          },
        }
      } else {
        await api.registerInviteSent({
          ...sharingResult,
          inviteCode,
        })
        return {
          appFolder: 'add-member-flow',
          windowProps: {
            isSent: true,
            familyData,
          },
        }
      }
    }
  } catch (e) {
    logger.error(`Caught openSharingWithContext error: ${(e as Error).message}`)
    exit({ aaaction: 'refresh' })
  }
}

/**
 * This function can handle the various requirements for
 * @param EndSheetOptions
 * @returns The next sheet to open, or undefined if none.
 */
export const handleAddMemberEndSheet = async (
  { isExit, shouldCreateChild, shouldInvite, familyData }: EndSheetOptions,
  api: Api
): Promise<NativeSheetProps | undefined> => {
  // Various sheets have various stages of the flow.
  if (isExit) {
    // If we close the sheet with family data, exit this flow and go to the family list.
    exit({ aaaction: 'refresh' })
  } else if (shouldCreateChild) {
    createChildAccount((isSuccess) => {
      logger.info(`created child account isSuccess: ${isSuccess}`)
      exit({ aaaction: 'refresh' })
    })
  } else if (shouldInvite && familyData) {
    return startAddMemberFlow({ api, familyData })
  }
}

export default handleAddMemberEndSheet

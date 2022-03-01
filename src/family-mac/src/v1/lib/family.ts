import { FamilyDetails, FamilyMember } from './api'

export const MAX_FAMILY_MEMBERS = 6

/**
 * Certain endpoints return partial member data, so we want to just replace the existing data with our updates while
 * not mutating the original familyData. If we merely mutate, React might not detect changes or re-render properly.
 * @param familyData The family data to copy.
 * @param updatedMember The member to insert. It's assumed that this member is already in the familyData.familyMembers array.
 * @returns A copy of familyData with the new member inside the familyMembers array.
 */
export const createFamilyDataWithUpdatedMember = (
  familyData: FamilyDetails,
  updatedMember: FamilyMember
): FamilyDetails => {
  const { familyMembers } = familyData
  const foundMemberIndex = familyMembers.findIndex(
    (member) => member.dsid === updatedMember.dsid
  )
  return {
    ...familyData,
    familyMembers: [
      ...familyMembers.slice(0, foundMemberIndex),
      updatedMember,
      ...familyMembers.slice(foundMemberIndex + 1),
    ],
  }
}

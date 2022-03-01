import { FamilyMember } from './api'

export default class Loc {
  // Each instance will get the locStrings on instantiation.
  locStrings: LocStrings

  constructor(locStrings: LocStrings) {
    this.locStrings = locStrings
  }

  get(locKey: string, replacements = {}): string {
    const { interpolateString, locStrings } = this
    return interpolateString(locStrings[locKey], replacements) || locKey
  }

  // Should only be used when supplied from the server.
  interpolateString(
    templateString: string | undefined,
    replacements: InterpolationReplacements
  ): string {
    let interpolatedString = templateString || ''
    if (templateString) {
      for (const i in replacements) {
        const replaceValue = replacements[i]
        // Regex replaces all occurrences, string only replaces one, so we need a regex.
        const regexIos = new RegExp(`@@${i}@@`, 'g')
        const regexOldFormat = new RegExp(`%{${i}}`, 'g')
        // Replace iOS style @@var@@
        interpolatedString = interpolatedString.replace(
          regexIos,
          `${replaceValue}`
        )
        // Replace old variable style as well %{var}
        interpolatedString = interpolatedString.replace(
          regexOldFormat,
          `${replaceValue}`
        )
      }
    }
    return interpolatedString
  }

  getRoleSubtitle(
    member: FamilyMember,
    organizerDsid: string,
    locale?: string
  ): string {
    const { age, ageClassification, dsid, hasParentalPrivileges } = member
    if (organizerDsid === dsid) {
      return this.get(
        'com.apple.cloud.familykit.familylist.member.subtitle.organizer.macos'
      )
    } else if (ageClassification === 'ADULT') {
      if (hasParentalPrivileges) {
        return this.get(
          'com.apple.cloud.familykit.familylist.member.subtitle.parent.macos'
        )
      } else {
        return this.get(
          'com.apple.cloud.familykit.familylist.member.subtitle.adult.macos'
        )
      }
    } else {
      return this.get(
        'com.apple.cloud.familykit.familylist.member.subtitle.minor.macos',
        { age: age?.toLocaleString(locale) }
      )
    }
  }
}

import dayjs from "dayjs";

// Calculate current age from birthdate in format YYYY-MM-DD
export function getAge(birthDate: Date) {
  return dayjs().diff(dayjs(birthDate), "year");
}

export function weeksAliveSinceBirth(birthday: string) {
  const today = dayjs();
  const birthDate = dayjs(birthday);
  const yearsAlive = getAge(birthDate.toDate());

  const birthdayThisYear = birthDate.add(yearsAlive, "year");
  const hasBirthdayOccurred = today.isAfter(birthdayThisYear);
  const completedYearsInWeeks =
    (hasBirthdayOccurred ? yearsAlive : yearsAlive - 1) * 52;
  const yearStartDate = hasBirthdayOccurred
    ? birthdayThisYear
    : birthDate.add(yearsAlive - 1, "year");
  const weeksAliveThisYear = today.diff(yearStartDate, "week");
  const totalWeeksAlive = completedYearsInWeeks + weeksAliveThisYear;
  return totalWeeksAlive;
}

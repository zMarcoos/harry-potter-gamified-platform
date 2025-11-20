import * as Achievements from "./achievements.service";
import * as Forum from "./forum.service";
import * as Announcements from "./announcements.service";
import * as Quizzes from "./quizzes.service";
import * as QuizSubmission from "./quiz-submission.service";
import * as Missions from "./missions.service";
import * as Shop from "./shop.service";
import * as Social from "./social.service";
import * as ClassUsers from "./users.service";

export const ClassService = {
  shop: Shop.shopService,
  quizSubmission: QuizSubmission.quizSubmissionService,
  achievements: Achievements.achievementsService,
  forum: Forum.forumService,
  announcements: Announcements.announcementService,
  quizzes: Quizzes.quizzesService,
  missions: Missions.missionsService,
  social: Social.socialService,
  users: ClassUsers.usersService,
};

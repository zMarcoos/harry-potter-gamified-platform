import { globalRepositories } from '@/lib/core/repositories';
import {
  QuizSchema,
  QuizQuestionSchema,
  type Quiz,
  type QuizQuestion,
} from '@/lib/core/types/quiz.type';
import { getClassOrThrow } from '../../utils/class';

export const quizzesService = {
  async getAll(classId: string): Promise<Quiz[]> {
    const clazz = await getClassOrThrow(classId);
    return clazz.quizzes ?? [];
  },

  async getOne(classId: string, quizId: string): Promise<Quiz | null> {
    const clazz = await getClassOrThrow(classId);
    return clazz.quizzes?.find((q) => q.id === quizId) ?? null;
  },

  async create(classId: string, data: Quiz): Promise<Quiz> {
    const newQuiz = QuizSchema.parse(data);

    await globalRepositories.classes.update(classId, (clazz) => {
      if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
      const quizzes = [...(clazz.quizzes ?? []), newQuiz];
      return { quizzes };
    });

    return newQuiz;
  },

  async update(
    classId: string,
    quizId: string,
    patch: Partial<Quiz>,
  ): Promise<Quiz> {
    let mergedQuiz: Quiz | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const current = clazz.quizzes?.find((q) => q.id === quizId);
        if (!current) throw new Error(`Quiz '${quizId}' não encontrado.`);

        const merged = QuizSchema.parse({ ...current, ...patch });
        mergedQuiz = merged;

        const quizzes = (clazz.quizzes ?? []).map((q) =>
          q.id === quizId ? merged : q,
        );
        return { quizzes };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!mergedQuiz) throw new Error('Falha ao atualizar quiz.');

    return mergedQuiz;
  },

  async delete(classId: string, quizId: string): Promise<void> {
    await globalRepositories.classes.update(classId, (clazz) => {
      if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
      const filtered = (clazz.quizzes ?? []).filter((q) => q.id !== quizId);
      return { quizzes: filtered };
    });
  },

  async addQuestion(
    classId: string,
    quizId: string,
    question: QuizQuestion,
  ): Promise<Quiz> {
    const newQuestion = QuizQuestionSchema.parse(question);
    let updatedQuiz: Quiz | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const quiz = clazz.quizzes?.find((q) => q.id === quizId);
        if (!quiz) throw new Error(`Quiz '${quizId}' não encontrado.`);

        const uQuiz = QuizSchema.parse({
          ...quiz,
          questions: [...quiz.questions, newQuestion],
        });
        updatedQuiz = uQuiz;

        const quizzes = (clazz.quizzes ?? []).map((q) =>
          q.id === quizId ? uQuiz : q,
        );
        return { quizzes };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!updatedQuiz) throw new Error('Falha ao adicionar questão.');

    return updatedQuiz;
  },

  async updateQuestion(
    classId: string,
    quizId: string,
    questionId: string,
    patch: Partial<QuizQuestion>,
  ): Promise<Quiz> {
    let updatedQuiz: Quiz | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const quiz = clazz.quizzes?.find((q) => q.id === quizId);
        if (!quiz) throw new Error(`Quiz '${quizId}' não encontrado.`);

        const idx = quiz.questions.findIndex((q) => q.id === questionId);
        if (idx === -1)
          throw new Error(`Questão '${questionId}' não encontrada no quiz.`);

        const mergedQuestion = QuizQuestionSchema.parse({
          ...quiz.questions[idx],
          ...patch,
        });

        const updatedQuestions = [...quiz.questions];
        updatedQuestions[idx] = mergedQuestion;

        const uQuiz = QuizSchema.parse({
          ...quiz,
          questions: updatedQuestions,
        });
        updatedQuiz = uQuiz;

        const quizzes = (clazz.quizzes ?? []).map((q) =>
          q.id === quizId ? uQuiz : q,
        );
        return { quizzes };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!updatedQuiz) throw new Error('Falha ao atualizar questão.');

    return updatedQuiz;
  },

  async removeQuestion(
    classId: string,
    quizId: string,
    questionId: string,
  ): Promise<Quiz> {
    let updatedQuiz: Quiz | null = null;

    const updatedClass = await globalRepositories.classes.update(
      classId,
      (clazz) => {
        if (!clazz) throw new Error(`Turma '${classId}' não encontrada.`);
        const quiz = clazz.quizzes?.find((q) => q.id === quizId);
        if (!quiz) throw new Error(`Quiz '${quizId}' não encontrado.`);

        const filteredQuestions = quiz.questions.filter(
          (q) => q.id !== questionId,
        );

        const uQuiz = QuizSchema.parse({
          ...quiz,
          questions: filteredQuestions,
        });
        updatedQuiz = uQuiz;

        const quizzes = (clazz.quizzes ?? []).map((quiz) =>
          quiz.id === quizId ? uQuiz : quiz,
        );
        return { quizzes };
      },
    );

    if (!updatedClass)
      throw new Error(`Turma '${classId}' não encontrada para atualização.`);
    if (!updatedQuiz) throw new Error('Falha ao remover questão.');

    return updatedQuiz;
  },
};

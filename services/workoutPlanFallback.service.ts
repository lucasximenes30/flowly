export type WorkoutObjective = 'muscle_gain' | 'fat_loss' | 'strength' | 'endurance' | 'general_fitness'
export type WorkoutLevel = 'beginner' | 'intermediate' | 'advanced'

type ExerciseMuscleGroup =
  | 'CHEST'
  | 'BACK'
  | 'LEGS'
  | 'SHOULDERS'
  | 'BICEPS'
  | 'TRICEPS'
  | 'ABS'
  | 'GLUTES'
  | 'CARDIO'
  | 'FULL_BODY'
  | 'OTHER'

interface GeneratedExercise {
  name: string
  sets: number
  reps: string
  targetWeight?: string
  notes?: string
  muscleGroup: ExerciseMuscleGroup
}

interface GeneratedWorkoutDay {
  name: string
  exercises: GeneratedExercise[]
}

interface GeneratedWorkoutPlan {
  planName: string
  days: GeneratedWorkoutDay[]
}

interface FallbackGeneratorInput {
  objective: WorkoutObjective
  level: WorkoutLevel
  daysPerWeek: number
  focus: string
  language: 'pt-BR' | 'en'
}

interface ExerciseTemplate {
  name: string
  sets: number
  reps: string
  muscleGroup: ExerciseMuscleGroup
  notes?: string
}

interface WorkoutDayTemplate {
  name: string
  exercises: ExerciseTemplate[]
}

// Template database organized by objective + level + days
const EXERCISE_TEMPLATES: Record<string, WorkoutDayTemplate[]> = {
  'muscle_gain_beginner_3': [
    {
      name: 'Day A - Full Body',
      exercises: [
        { name: 'Barbell Bench Press', sets: 3, reps: '8-10', muscleGroup: 'CHEST' },
        { name: 'Barbell Rows', sets: 3, reps: '8-10', muscleGroup: 'BACK' },
        { name: 'Barbell Squats', sets: 3, reps: '8-10', muscleGroup: 'LEGS' },
        { name: 'Overhead Press', sets: 3, reps: '8-10', muscleGroup: 'SHOULDERS' },
        { name: 'Deadlifts', sets: 2, reps: '5-6', muscleGroup: 'BACK' },
      ],
    },
    {
      name: 'Day B - Full Body',
      exercises: [
        { name: 'Incline Barbell Press', sets: 3, reps: '8-10', muscleGroup: 'CHEST' },
        { name: 'Weighted Pull-ups', sets: 3, reps: '6-8', muscleGroup: 'BACK' },
        { name: 'Leg Press', sets: 3, reps: '8-10', muscleGroup: 'LEGS' },
        { name: 'Dumbbell Lateral Raise', sets: 3, reps: '10-12', muscleGroup: 'SHOULDERS' },
        { name: 'Barbell Rows', sets: 3, reps: '8-10', muscleGroup: 'BACK' },
      ],
    },
    {
      name: 'Day C - Full Body',
      exercises: [
        { name: 'Dumbbell Bench Press', sets: 3, reps: '8-10', muscleGroup: 'CHEST' },
        { name: 'Cable Rows', sets: 3, reps: '10-12', muscleGroup: 'BACK' },
        { name: 'Leg Curls', sets: 3, reps: '10-12', muscleGroup: 'LEGS' },
        { name: 'Machine Shoulder Press', sets: 3, reps: '10-12', muscleGroup: 'SHOULDERS' },
        { name: 'Barbell Curls', sets: 3, reps: '8-10', muscleGroup: 'BICEPS' },
      ],
    },
  ],
  'muscle_gain_intermediate_4': [
    {
      name: 'Day A - Chest & Triceps',
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: '6-8', muscleGroup: 'CHEST' },
        { name: 'Incline Dumbbell Press', sets: 3, reps: '8-10', muscleGroup: 'CHEST' },
        { name: 'Cable Flyes', sets: 3, reps: '10-12', muscleGroup: 'CHEST' },
        { name: 'Tricep Dips', sets: 3, reps: '8-10', muscleGroup: 'TRICEPS' },
        { name: 'Rope Pushdowns', sets: 3, reps: '10-12', muscleGroup: 'TRICEPS' },
      ],
    },
    {
      name: 'Day B - Back & Biceps',
      exercises: [
        { name: 'Deadlifts', sets: 4, reps: '5-6', muscleGroup: 'BACK' },
        { name: 'Weighted Pull-ups', sets: 3, reps: '6-8', muscleGroup: 'BACK' },
        { name: 'Barbell Rows', sets: 3, reps: '6-8', muscleGroup: 'BACK' },
        { name: 'Barbell Curls', sets: 3, reps: '8-10', muscleGroup: 'BICEPS' },
        { name: 'Hammer Curls', sets: 3, reps: '10-12', muscleGroup: 'BICEPS' },
      ],
    },
    {
      name: 'Day C - Legs',
      exercises: [
        { name: 'Barbell Squats', sets: 4, reps: '6-8', muscleGroup: 'LEGS' },
        { name: 'Romanian Deadlifts', sets: 3, reps: '8-10', muscleGroup: 'LEGS' },
        { name: 'Leg Press', sets: 3, reps: '8-10', muscleGroup: 'LEGS' },
        { name: 'Leg Curls', sets: 3, reps: '10-12', muscleGroup: 'LEGS' },
        { name: 'Leg Extensions', sets: 3, reps: '12-15', muscleGroup: 'LEGS' },
      ],
    },
    {
      name: 'Day D - Shoulders & Accessories',
      exercises: [
        { name: 'Overhead Press', sets: 4, reps: '6-8', muscleGroup: 'SHOULDERS' },
        { name: 'Lateral Raises', sets: 3, reps: '10-12', muscleGroup: 'SHOULDERS' },
        { name: 'Reverse Flyes', sets: 3, reps: '12-15', muscleGroup: 'SHOULDERS' },
        { name: 'Cable Lateral Raise', sets: 3, reps: '12-15', muscleGroup: 'SHOULDERS' },
        { name: 'Barbell Curls', sets: 2, reps: '8-10', muscleGroup: 'BICEPS' },
      ],
    },
  ],
  'fat_loss_beginner_3': [
    {
      name: 'Day A - Cardio & Upper',
      exercises: [
        { name: 'Treadmill or Cycling', sets: 1, reps: '20-30min', muscleGroup: 'CARDIO' },
        { name: 'Push-ups', sets: 3, reps: '8-12', muscleGroup: 'CHEST' },
        { name: 'Bent-over Rows', sets: 3, reps: '10-12', muscleGroup: 'BACK' },
        { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12', muscleGroup: 'SHOULDERS' },
      ],
    },
    {
      name: 'Day B - Cardio & Legs',
      exercises: [
        { name: 'Elliptical or Stair Climber', sets: 1, reps: '20-30min', muscleGroup: 'CARDIO' },
        { name: 'Goblet Squats', sets: 3, reps: '12-15', muscleGroup: 'LEGS' },
        { name: 'Walking Lunges', sets: 3, reps: '10-12', muscleGroup: 'LEGS' },
        { name: 'Leg Raises', sets: 3, reps: '12-15', muscleGroup: 'ABS' },
      ],
    },
    {
      name: 'Day C - HIIT & Core',
      exercises: [
        { name: 'Jump Rope', sets: 1, reps: '15-20min', muscleGroup: 'CARDIO' },
        { name: 'Burpees', sets: 3, reps: '10', muscleGroup: 'FULL_BODY' },
        { name: 'Planks', sets: 3, reps: '30-60sec', muscleGroup: 'ABS' },
        { name: 'Mountain Climbers', sets: 3, reps: '20', muscleGroup: 'FULL_BODY' },
      ],
    },
  ],
  'strength_intermediate_4': [
    {
      name: 'Day A - Bench Press Focus',
      exercises: [
        { name: 'Barbell Bench Press', sets: 5, reps: '3-5', muscleGroup: 'CHEST' },
        { name: 'Incline Bench Press', sets: 3, reps: '5-6', muscleGroup: 'CHEST' },
        { name: 'Weighted Dips', sets: 3, reps: '5-6', muscleGroup: 'TRICEPS' },
        { name: 'Dumbbell Bench Press', sets: 2, reps: '6-8', muscleGroup: 'CHEST' },
      ],
    },
    {
      name: 'Day B - Squat Focus',
      exercises: [
        { name: 'Barbell Squats', sets: 5, reps: '3-5', muscleGroup: 'LEGS' },
        { name: 'Front Squats', sets: 3, reps: '5-6', muscleGroup: 'LEGS' },
        { name: 'Hack Squats', sets: 3, reps: '6-8', muscleGroup: 'LEGS' },
        { name: 'Leg Press', sets: 2, reps: '8-10', muscleGroup: 'LEGS' },
      ],
    },
    {
      name: 'Day C - Deadlift Focus',
      exercises: [
        { name: 'Deadlifts', sets: 5, reps: '3-5', muscleGroup: 'BACK' },
        { name: 'Rack Pulls', sets: 3, reps: '5-6', muscleGroup: 'BACK' },
        { name: 'Barbell Rows', sets: 3, reps: '5-6', muscleGroup: 'BACK' },
        { name: 'T-Bar Rows', sets: 2, reps: '6-8', muscleGroup: 'BACK' },
      ],
    },
    {
      name: 'Day D - Overhead Press Focus',
      exercises: [
        { name: 'Barbell Overhead Press', sets: 5, reps: '3-5', muscleGroup: 'SHOULDERS' },
        { name: 'Incline Press', sets: 3, reps: '5-6', muscleGroup: 'SHOULDERS' },
        { name: 'Push Press', sets: 3, reps: '5-6', muscleGroup: 'SHOULDERS' },
        { name: 'Military Press Machine', sets: 2, reps: '8-10', muscleGroup: 'SHOULDERS' },
      ],
    },
  ],
  'general_fitness_beginner_3': [
    {
      name: 'Day A - Full Body',
      exercises: [
        { name: 'Treadmill Warm-up', sets: 1, reps: '5min', muscleGroup: 'CARDIO' },
        { name: 'Chest Press Machine', sets: 2, reps: '10-12', muscleGroup: 'CHEST' },
        { name: 'Lat Pulldown', sets: 2, reps: '10-12', muscleGroup: 'BACK' },
        { name: 'Leg Press', sets: 2, reps: '10-12', muscleGroup: 'LEGS' },
        { name: 'Machine Shoulder Press', sets: 2, reps: '10-12', muscleGroup: 'SHOULDERS' },
      ],
    },
    {
      name: 'Day B - Cardio & Core',
      exercises: [
        { name: 'Elliptical', sets: 1, reps: '15-20min', muscleGroup: 'CARDIO' },
        { name: 'Crunches', sets: 2, reps: '15', muscleGroup: 'ABS' },
        { name: 'Planks', sets: 2, reps: '30-45sec', muscleGroup: 'ABS' },
        { name: 'Leg Raises', sets: 2, reps: '10', muscleGroup: 'ABS' },
      ],
    },
    {
      name: 'Day C - Functional Movement',
      exercises: [
        { name: 'Rowing Machine', sets: 1, reps: '10-15min', muscleGroup: 'FULL_BODY' },
        { name: 'Goblet Squats', sets: 2, reps: '12', muscleGroup: 'LEGS' },
        { name: 'Push-ups', sets: 2, reps: '6-10', muscleGroup: 'CHEST' },
        { name: 'Assisted Pull-ups', sets: 2, reps: '6-10', muscleGroup: 'BACK' },
      ],
    },
  ],
}

function getPlanName(objective: WorkoutObjective, level: WorkoutLevel, daysPerWeek: number, language: 'pt-BR' | 'en'): string {
  const objectiveNames = {
    'pt-BR': {
      muscle_gain: 'Hipertrofia',
      fat_loss: 'Perda de Gordura',
      strength: 'Força',
      endurance: 'Resistência',
      general_fitness: 'Condicionamento Geral',
    },
    'en': {
      muscle_gain: 'Hypertrophy',
      fat_loss: 'Fat Loss',
      strength: 'Strength',
      endurance: 'Endurance',
      general_fitness: 'General Fitness',
    },
  }

  const levelNames = {
    'pt-BR': { beginner: 'Iniciante', intermediate: 'Intermediário', advanced: 'Avançado' },
    'en': { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' },
  }

  const sep = language === 'pt-BR' ? ' - ' : ' - '
  const days = language === 'pt-BR' ? `${daysPerWeek}x/sem` : `${daysPerWeek}x/week`

  return `${objectiveNames[language][objective]}${sep}${levelNames[language][level]}${sep}${days}`
}

export function generateFallbackWorkoutPlan(input: FallbackGeneratorInput): GeneratedWorkoutPlan {
  const { objective, level, daysPerWeek, language } = input

  // Find matching template
  const templateKey = `${objective}_${level}_${daysPerWeek}`
  let selectedDays = EXERCISE_TEMPLATES[templateKey]

  // Fallback to 3-day beginner if exact template not found
  if (!selectedDays) {
    const fallbackKey = `${objective}_beginner_3`
    selectedDays = EXERCISE_TEMPLATES[fallbackKey]
  }

  // Final fallback to general fitness beginner
  if (!selectedDays) {
    selectedDays = EXERCISE_TEMPLATES['general_fitness_beginner_3']
  }

  // Select the right number of days and adjust names if needed
  const selectedTemplate = selectedDays.slice(0, daysPerWeek)

  const plan: GeneratedWorkoutPlan = {
    planName: getPlanName(objective, level, daysPerWeek, language),
    days: selectedTemplate.map((day) => ({
      name: day.name,
      exercises: day.exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        muscleGroup: ex.muscleGroup,
        notes: ex.notes,
      })),
    })),
  }

  return plan
}

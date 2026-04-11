export const EXERCISE_MUSCLE_GROUPS = [
  'CHEST',
  'BACK',
  'LEGS',
  'SHOULDERS',
  'BICEPS',
  'TRICEPS',
  'ABS',
  'GLUTES',
  'CARDIO',
  'FULL_BODY',
  'OTHER',
] as const

export type ExerciseMuscleGroupValue = (typeof EXERCISE_MUSCLE_GROUPS)[number]

export interface SystemExerciseSeed {
  namePt: string
  nameEn: string
  muscleGroup: ExerciseMuscleGroupValue
  equipment?: string
  imageUrl?: string
}

export const SYSTEM_EXERCISES: SystemExerciseSeed[] = [
  { namePt: 'Supino reto', nameEn: 'Bench Press', muscleGroup: 'CHEST', equipment: 'Barbell' },
  { namePt: 'Supino inclinado', nameEn: 'Incline Bench Press', muscleGroup: 'CHEST', equipment: 'Barbell' },
  { namePt: 'Supino declinado', nameEn: 'Decline Bench Press', muscleGroup: 'CHEST', equipment: 'Barbell' },
  { namePt: 'Crucifixo com halteres', nameEn: 'Dumbbell Fly', muscleGroup: 'CHEST', equipment: 'Dumbbell' },
  { namePt: 'Cross over', nameEn: 'Cable Fly', muscleGroup: 'CHEST', equipment: 'Cable' },
  { namePt: 'Flexao de bracos', nameEn: 'Push-up', muscleGroup: 'CHEST', equipment: 'Bodyweight' },

  { namePt: 'Remada curvada', nameEn: 'Bent-over Row', muscleGroup: 'BACK', equipment: 'Barbell' },
  { namePt: 'Remada unilateral', nameEn: 'One-arm Dumbbell Row', muscleGroup: 'BACK', equipment: 'Dumbbell' },
  { namePt: 'Puxada alta', nameEn: 'Lat Pulldown', muscleGroup: 'BACK', equipment: 'Cable' },
  { namePt: 'Barra fixa', nameEn: 'Pull-up', muscleGroup: 'BACK', equipment: 'Bodyweight' },
  { namePt: 'Levantamento terra', nameEn: 'Deadlift', muscleGroup: 'BACK', equipment: 'Barbell' },
  { namePt: 'Remada baixa', nameEn: 'Seated Cable Row', muscleGroup: 'BACK', equipment: 'Cable' },

  { namePt: 'Agachamento livre', nameEn: 'Back Squat', muscleGroup: 'LEGS', equipment: 'Barbell' },
  { namePt: 'Agachamento frontal', nameEn: 'Front Squat', muscleGroup: 'LEGS', equipment: 'Barbell' },
  { namePt: 'Leg press', nameEn: 'Leg Press', muscleGroup: 'LEGS', equipment: 'Machine' },
  { namePt: 'Cadeira extensora', nameEn: 'Leg Extension', muscleGroup: 'LEGS', equipment: 'Machine' },
  { namePt: 'Mesa flexora', nameEn: 'Leg Curl', muscleGroup: 'LEGS', equipment: 'Machine' },
  { namePt: 'Afundo', nameEn: 'Lunge', muscleGroup: 'LEGS', equipment: 'Bodyweight' },
  { namePt: 'Passada com halteres', nameEn: 'Dumbbell Walking Lunge', muscleGroup: 'LEGS', equipment: 'Dumbbell' },
  { namePt: 'Levantamento romeno', nameEn: 'Romanian Deadlift', muscleGroup: 'LEGS', equipment: 'Barbell' },
  { namePt: 'Panturrilha em pe', nameEn: 'Standing Calf Raise', muscleGroup: 'LEGS', equipment: 'Machine' },
  { namePt: 'Panturrilha sentado', nameEn: 'Seated Calf Raise', muscleGroup: 'LEGS', equipment: 'Machine' },

  { namePt: 'Desenvolvimento militar', nameEn: 'Overhead Press', muscleGroup: 'SHOULDERS', equipment: 'Barbell' },
  { namePt: 'Desenvolvimento com halteres', nameEn: 'Dumbbell Shoulder Press', muscleGroup: 'SHOULDERS', equipment: 'Dumbbell' },
  { namePt: 'Elevacao lateral', nameEn: 'Lateral Raise', muscleGroup: 'SHOULDERS', equipment: 'Dumbbell' },
  { namePt: 'Elevacao frontal', nameEn: 'Front Raise', muscleGroup: 'SHOULDERS', equipment: 'Dumbbell' },
  { namePt: 'Crucifixo invertido', nameEn: 'Reverse Fly', muscleGroup: 'SHOULDERS', equipment: 'Dumbbell' },
  { namePt: 'Face pull', nameEn: 'Face Pull', muscleGroup: 'SHOULDERS', equipment: 'Cable' },

  { namePt: 'Rosca direta', nameEn: 'Barbell Curl', muscleGroup: 'BICEPS', equipment: 'Barbell' },
  { namePt: 'Rosca alternada', nameEn: 'Alternating Dumbbell Curl', muscleGroup: 'BICEPS', equipment: 'Dumbbell' },
  { namePt: 'Rosca martelo', nameEn: 'Hammer Curl', muscleGroup: 'BICEPS', equipment: 'Dumbbell' },
  { namePt: 'Rosca concentrada', nameEn: 'Concentration Curl', muscleGroup: 'BICEPS', equipment: 'Dumbbell' },
  { namePt: 'Rosca Scott', nameEn: 'Preacher Curl', muscleGroup: 'BICEPS', equipment: 'Machine' },

  { namePt: 'Triceps pulley', nameEn: 'Tricep Pushdown', muscleGroup: 'TRICEPS', equipment: 'Cable' },
  { namePt: 'Triceps frances', nameEn: 'French Press', muscleGroup: 'TRICEPS', equipment: 'Dumbbell' },
  { namePt: 'Triceps testa', nameEn: 'Skull Crusher', muscleGroup: 'TRICEPS', equipment: 'Barbell' },
  { namePt: 'Mergulho no banco', nameEn: 'Bench Dip', muscleGroup: 'TRICEPS', equipment: 'Bodyweight' },
  { namePt: 'Triceps coice', nameEn: 'Tricep Kickback', muscleGroup: 'TRICEPS', equipment: 'Dumbbell' },

  { namePt: 'Abdominal crunch', nameEn: 'Crunch', muscleGroup: 'ABS', equipment: 'Bodyweight' },
  { namePt: 'Abdominal infra', nameEn: 'Leg Raise', muscleGroup: 'ABS', equipment: 'Bodyweight' },
  { namePt: 'Prancha', nameEn: 'Plank', muscleGroup: 'ABS', equipment: 'Bodyweight' },
  { namePt: 'Abdominal bicicleta', nameEn: 'Bicycle Crunch', muscleGroup: 'ABS', equipment: 'Bodyweight' },
  { namePt: 'Russian twist', nameEn: 'Russian Twist', muscleGroup: 'ABS', equipment: 'Bodyweight' },

  { namePt: 'Hip thrust', nameEn: 'Hip Thrust', muscleGroup: 'GLUTES', equipment: 'Barbell' },
  { namePt: 'Glute bridge', nameEn: 'Glute Bridge', muscleGroup: 'GLUTES', equipment: 'Bodyweight' },
  { namePt: 'Coice no cabo', nameEn: 'Cable Kickback', muscleGroup: 'GLUTES', equipment: 'Cable' },
  { namePt: 'Abducao de quadril', nameEn: 'Hip Abduction', muscleGroup: 'GLUTES', equipment: 'Machine' },
  { namePt: 'Step up', nameEn: 'Step-up', muscleGroup: 'GLUTES', equipment: 'Bodyweight' },

  { namePt: 'Corrida na esteira', nameEn: 'Treadmill Run', muscleGroup: 'CARDIO', equipment: 'Machine' },
  { namePt: 'Bicicleta ergometrica', nameEn: 'Stationary Bike', muscleGroup: 'CARDIO', equipment: 'Machine' },
  { namePt: 'Remo ergometrico', nameEn: 'Rowing Machine', muscleGroup: 'CARDIO', equipment: 'Machine' },
  { namePt: 'Escada', nameEn: 'Stair Climber', muscleGroup: 'CARDIO', equipment: 'Machine' },
  { namePt: 'Polichinelo', nameEn: 'Jumping Jack', muscleGroup: 'CARDIO', equipment: 'Bodyweight' },

  { namePt: 'Burpee', nameEn: 'Burpee', muscleGroup: 'FULL_BODY', equipment: 'Bodyweight' },
  { namePt: 'Kettlebell swing', nameEn: 'Kettlebell Swing', muscleGroup: 'FULL_BODY', equipment: 'Kettlebell' },
  { namePt: 'Thruster', nameEn: 'Thruster', muscleGroup: 'FULL_BODY', equipment: 'Dumbbell' },
  { namePt: 'Clean and press', nameEn: 'Clean and Press', muscleGroup: 'FULL_BODY', equipment: 'Barbell' },
  { namePt: 'Farmer walk', nameEn: 'Farmer Walk', muscleGroup: 'FULL_BODY', equipment: 'Dumbbell' },

  { namePt: 'Mobilidade de quadril', nameEn: 'Hip Mobility Drill', muscleGroup: 'OTHER', equipment: 'Bodyweight' },
  { namePt: 'Alongamento posterior', nameEn: 'Hamstring Stretch', muscleGroup: 'OTHER', equipment: 'Bodyweight' },
  { namePt: 'Aquecimento geral', nameEn: 'General Warm-up', muscleGroup: 'OTHER', equipment: 'Bodyweight' },
]

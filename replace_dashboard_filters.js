const fs = require('fs');

let fileContent = fs.readFileSync('app/dashboard/DashboardClient.tsx', 'utf-8');

// 1. Add filter states
const stateReplacement = `
  const [selectedMonth, setSelectedMonth] = useState(currentYM)
  const [sortDesc, setSortDesc] = useState(true) // true = most recent first

  // Transaction filters
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')
  const [filterDate, setFilterDate] = useState<string>('')
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterCardId, setFilterCardId] = useState<string>('ALL')
  const [showFilters, setShowFilters] = useState(false)

  const clearFilters = () => {
    setFilterType('ALL')
    setFilterDate('')
    setFilterCategory('')
    setFilterCardId('ALL')
  }
`;

fileContent = fileContent.replace(
  /const \[selectedMonth, setSelectedMonth\] = useState.*?const \[sortDesc, setSortDesc\] = useState\(true\).*?\n/s,
  stateReplacement.trim() + '\n'
);

fs.writeFileSync('app/dashboard/DashboardClient.tsx', fileContent);

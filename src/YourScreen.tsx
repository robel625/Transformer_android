const YourScreen = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    region: '',
    csc: '',
    substation: '',
    feeder: '',
  });

  return (
    <>
      <TouchableOpacity onPress={() => setShowFilters(true)}>
        <Icon name="filter-list" size={20} />
      </TouchableOpacity>

      <FilterModal
        visible={showFilters}
        filters={filters}
        regions={regions}
        selectedCSCs={selectedCSCs}
        selectedSubstations={selectedSubstations}
        selectedFeeders={selectedFeeders}
        onRegionChange={(value) => setFilters(prev => ({ ...prev, region: value }))}
        onCSCChange={(value) => setFilters(prev => ({ ...prev, csc: value }))}
        onSubstationChange={(value) => setFilters(prev => ({ ...prev, substation: value }))}
        onFeederChange={(value) => setFilters(prev => ({ ...prev, feeder: value }))}
        onReset={() => setFilters({ region: '', csc: '', substation: '', feeder: '' })}
        onApply={() => {
          // Handle apply filters
          setShowFilters(false);
        }}
        onClose={() => setShowFilters(false)}
      />
    </>
  );
};
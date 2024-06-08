const AttributeSelector = ({ availableAttributes, onAttributeSelect }) => {
  const handleSelectionChange = event => {
    const selected = Array.from(event.target.selectedOptions, option => option.value);
    onAttributeSelect(selected);
  };

  return (
    <select multiple value={availableAttributes.map(attr => attr.name)} onChange={handleSelectionChange} className="form-multiselect block w-full mt-1">
      {availableAttributes.map(attribute => (
        <option key={attribute.id} value={attribute.name}>
          {attribute.name}
        </option>
      ))}
    </select>
  );
};

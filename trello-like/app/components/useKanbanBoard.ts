import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useState } from 'react';

export function useKanbanBoard() {
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  
  // Sensors for better drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires 8px movement to start drag, prevents accidental drags on clicks
      },
    })
  );
  
  return {
    isAddingList,
    setIsAddingList,
    newListTitle,
    setNewListTitle,
    sensors
  };
}
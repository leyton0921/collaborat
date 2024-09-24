'use client';

import { Navbar } from "../UI/navbaruser";
import styled from "styled-components";
import { useEffect, useState } from "react";

// Definición de interfaces
interface Task {
  id: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  status: 'pending' | 'in progress' | 'completed';
  comment: string;
  showComment?: boolean;
  collaboratorAssignedName: string;
}

export default function Users() {
  const links = [
    { href: "/user", name: "Mis Tareas" },
    { href: "/taskunassign", name: "Tareas Sin Asignar" },
    { href: "/profile", name: "Perfil" },
    { href: "/", name: "Salir" },
  ];

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const projectId = '3bea95d3-31a4-4307-9e4a-055ae943ef65'; // Cambia esto por tu ID de proyecto

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/v1/tasks/projects?projectId=${projectId}`);
        if (!response.ok) throw new Error('Error al cargar las tareas');

        const data: Task[] = await response.json();
        setTasks(data);
        saveTasksToLocalStorage(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    // Cargar tareas desde localStorage si existen
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
      setLoading(false);
    } else {
      fetchTasks();
    }
  }, [projectId]);

  const saveTasksToLocalStorage = (tasks: Task[]) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  const handleStatusChange = (id: string, newStatus: 'pending' | 'in progress' | 'completed') => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);
    saveTasksToLocalStorage(updatedTasks);
  };

  const handleCommentChange = (id: string, comment: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, comment } : task
    );
    setTasks(updatedTasks);
    saveTasksToLocalStorage(updatedTasks);
  };

  const toggleCommentVisibility = (id: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, showComment: !task.showComment } : task
    );
    setTasks(updatedTasks);
    saveTasksToLocalStorage(updatedTasks);
  };

  if (loading) {
    return <Container>Cargando tareas...</Container>;
  }

  return (
    <Container>
      <Navbar links={links} />
      <Content>
        <h2>Todas las Tareas</h2>
        <TaskGrid>
          {tasks.map((task) => (
            <TaskCard key={task.id} status={task.status}>
              <h3>{task.name}</h3>
              <p><strong>Descripción:</strong> {task.description}</p>
              <PriorityBadge priority={task.priority}>{task.priority}</PriorityBadge>
              <p><strong>Fecha de Vencimiento:</strong> {task.dueDate}</p>
              <p><strong>Estado:</strong> {task.status}</p>
              <p><strong>Asignado a:</strong> {task.collaboratorAssignedName}</p>
              <ToggleButton onClick={() => toggleCommentVisibility(task.id)}>
                {task.showComment ? 'Ocultar Comentario' : 'Dejar Comentario'}
              </ToggleButton>
              {task.showComment && (
                <CommentField 
                  value={task.comment} 
                  onChange={(e) => handleCommentChange(task.id, e.target.value)} 
                  placeholder="Deja un comentario..."
                />
              )}
              <SmallButton onClick={() => handleStatusChange(task.id, 'in progress')}>
                Marcar como En Progreso
              </SmallButton>
              <SmallButton onClick={() => handleStatusChange(task.id, 'completed')}>
                Marcar como Completada
              </SmallButton>
            </TaskCard>
          ))}
        </TaskGrid>
      </Content>
    </Container>
  );
}

// Estilos
const Container = styled.div`
  font-family: 'Segoe UI', 'Arial', sans-serif;
  text-align: center;
  margin-top: 20px;
`;

const Content = styled.div`
  padding: 0 20px;
`;

const TaskGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* Tamaño mínimo adaptable */
  gap: 20px; /* Espacio entre las tarjetas */
  margin-top: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr; /* Una columna en pantallas pequeñas */
  }
`;

const TaskCard = styled.div<{ status: string }>`
  background-color: ${({ status }) => (status === 'pending' ? '#ffffff' : (status === 'in progress' ? '#fff3cd' : '#e3f9e5'))};
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: left;
  
  h3 {
    color: #28a745;
    margin-bottom: 10px;
    font-size: 1.2rem;
    font-weight: bold;
  }

  p {
    margin: 5px 0;
    font-family: 'Segoe UI', 'Arial', sans-serif;
  }
`;

const PriorityBadge = styled.span<{ priority: 'high' | 'medium' | 'low' }>`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  color: white;
  margin: 5px 0;
  font-size: 0.8rem;
  background-color: ${({ priority }) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#ccc';
    }
  }};
`;

const CommentField = styled.textarea`
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 14px;
  box-sizing: border-box;
  resize: none;
`;

const Button = styled.button`
  background-color: #28a745;
  color: white;
  padding: 6px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  width: 100%;
  margin-top: 10px;

  &:hover {
    background-color: #218838;
  }
`;

const ToggleButton = styled(Button)`
  background-color: #007bff;
  
  &:hover {
    background-color: #0056b3;
  }
`;

const SmallButton = styled(Button)`
  padding: 4px;
  font-size: 12px;
`;

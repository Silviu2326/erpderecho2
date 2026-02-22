# Guía Completa de React

## ¿Qué es React?

React es una biblioteca JavaScript de código abierto desarrollada por Meta (Facebook) para construir interfaces de usuario interactivas. Utiliza un modelo de programación declarativo basado en componentes.

### Características Principales

- **Virtual DOM**: React crea una representación en memoria del DOM real, optimizando las actualizaciones
- **Componentes**: Bloques reutilizables que encapsulan lógica y presentación
- **JSX**: Sintaxis que permite escribir HTML dentro de JavaScript
- **Unidirectional Data Flow**: Los datos fluyen en una sola dirección

---

## Conceptos Básicos

### JSX

JSX es una extensión de sintaxis que permite escribir código similar a HTML dentro de JavaScript:

```jsx
function Saludo({ nombre }) {
  return <h1>Hola, {nombre}!</h1>;
}
```

### Componentes

Los componentes son funciones que retornan elementos React. Pueden ser de dos tipos:

```jsx
// Componente funcional (recomendado)
function MiComponente(props) {
  return <div>Hola, {props.texto}</div>;
}

// Componente de clase (legacy)
class MiComponente extends React.Component {
  render() {
    return <div>Hola, {this.props.texto}</div>;
  }
}
```

### Props

Las props son parámetros que se pasan a los componentes:

```jsx
function Card({ titulo, children }) {
  return (
    <div className="card">
      <h2>{titulo}</h2>
      {children}
    </div>
  );
}

// Uso
<Card titulo="Mi Card">
  <p>Contenido hijo</p>
</Card>
```

---

## Estado (useState)

El hook `useState` permite agregar estado a componentes funcionales:

```jsx
import { useState } from 'react';

function Contador() {
  const [contador, setContador] = useState(0);
  
  return (
    <div>
      <p>Count: {contador}</p>
      <button onClick={() => setContador(contador + 1)}>
        Incrementar
      </button>
    </div>
  );
}
```

### Estado con objetos

```jsx
function Formulario() {
  const [datos, setDatos] = useState({ nombre: '', email: '' });
  
  const handleChange = (e) => {
    setDatos({
      ...datos,
      [e.target.name]: e.target.value
    });
  };
  
  return (
    <form>
      <input 
        name="nombre" 
        value={datos.nombre} 
        onChange={handleChange} 
      />
      <input 
        name="email" 
        value={datos.email} 
        onChange={handleChange} 
      />
    </form>
  );
}
```

---

## Hooks

### useEffect

Ejecuta efectos secundarios (fetching de datos, suscripciones, etc.):

```jsx
import { useEffect, useState } from 'react';

function DatosUsuario({ userId }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  
  useEffect(() => {
    async function fetchUsuario() {
      setCargando(true);
      const respuesta = await fetch(`/api/users/${userId}`);
      const datos = await respuesta.json();
      setUsuario(datos);
      setCargando(false);
    }
    
    fetchUsuario();
  }, [userId]); // Se ejecuta cuando userId cambia
  
  if (cargando) return <p>Cargando...</p>;
  
  return <div>{usuario.nombre}</div>;
}
```

### cleanup en useEffect

```jsx
useEffect(() => {
  const suscripcion = evento.on('mensaje', handler);
  
  return () => {
    // Cleanup: se ejecuta antes del siguiente efecto o al desmontar
    suscripcion.unsubscribe();
  };
}, [dependencias]);
```

### useContext

Consume contexto sin propagación manual de props:

```jsx
// Crear contexto
const TemaContext = createContext('claro');

// Provider
function App() {
  return (
    <TemaContext.Provider value="oscuro">
      <MiComponente />
    </TemaContext.Provider>
  );
}

// Consumir contexto
function MiComponente() {
  const tema = useContext(TemaContext);
  return <div className={tema}>Contenido</div>;
}
```

### useReducer

Gestión de estado compleja con acciones:

```jsx
function reducer(estado, accion) {
  switch (accion.tipo) {
    case 'INCREMENTAR':
      return { contador: estado.contador + 1 };
    case 'DECREMENTAR':
      return { contador: estado.contador - 1 };
    case 'RESET':
      return { contador: 0 };
    default:
      return estado;
  }
}

function Contador() {
  const [estado, dispatch] = useReducer(reducer, { contador: 0 });
  
  return (
    <div>
      <p>Count: {estado.contador}</p>
      <button onClick={() => dispatch({ tipo: 'INCREMENTAR' })}>+</button>
      <button onClick={() => dispatch({ tipo: 'DECREMENTAR' })}>-</button>
      <button onClick={() => dispatch({ tipo: 'RESET' })}>Reset</button>
    </div>
  );
}
```

### useMemo y useCallback

Optimización de rendimiento:

```jsx
function Lista({ items, filtro }) {
  // Memoiza el resultado de operaciones costosas
  const itemsFiltrados = useMemo(
    () => items.filter(item => item.includes(filtro)),
    [items, filtro]
  );
  
  // Memoiza la función para evitar re-renders innecesarios
  const handleClick = useCallback((id) => {
    console.log('Click:', id);
  }, []);
  
  return (
    <ul>
      {itemsFiltrados.map(item => (
        <Item key={item.id} onClick={handleClick} />
      ))}
    </ul>
  );
}
```

### useRef

Referencia mutable que persiste entre renders:

```jsx
function InputFocus() {
  const inputRef = useRef(null);
  
  const handleFocus = () => {
    inputRef.current.focus();
  };
  
  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={handleFocus}>Focus</button>
    </div>
  );
}
```

---

## Patrones de Componentes

### Componentes con children

```jsx
function Layout({ children, sidebar }) {
  return (
    <div className="layout">
      <aside>{sidebar}</aside>
      <main>{children}</main>
    </div>
  );
}

// Uso
<Layout sidebar={<Sidebar />}>
  <ContenidoPrincipal />
</Layout>
```

### Render Props

```jsx
function MouseTracker({ render }) {
  const [posicion, setPosicion] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosicion({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return render(posicion);
}

// Uso
<MouseTracker render={({ x, y }) => (
  <p>Mouse en: {x}, {y}</p>
)} />
```

### Higher-Order Components (HOC)

```jsx
function withLoading(Component) {
  return function WithLoading({ isLoading, ...props }) {
    if (isLoading) return <p>Cargando...</p>;
    return <Component {...props} />;
  };
}

// Uso
const UsuarioConLoading = withLoading(Usuario);
<UsuarioConLoading isLoading={cargando} usuario={usuario} />
```

---

## Ejemplos Prácticos

### Todo List

```jsx
function TodoApp() {
  const [tareas, setTareas] = useState([]);
  const [input, setInput] = useState('');
  
  const agregarTarea = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setTareas([...tareas, { 
      id: Date.now(), 
      texto: input, 
      completada: false 
    }]);
    setInput('');
  };
  
  const toggleTarea = (id) => {
    setTareas(tareas.map(t => 
      t.id === id ? { ...t, completada: !t.completada } : t
    ));
  };
  
  const eliminarTarea = (id) => {
    setTareas(tareas.filter(t => t.id !== id));
  };
  
  return (
    <div>
      <h1>Mis Tareas</h1>
      <form onSubmit={agregarTarea}>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nueva tarea..."
        />
        <button type="submit">Agregar</button>
      </form>
      <ul>
        {tareas.map(tarea => (
          <li key={tarea.id}>
            <span 
              style={{ 
                textDecoration: tarea.completada ? 'line-through' : 'none' 
              }}
              onClick={() => toggleTarea(tarea.id)}
            >
              {tarea.texto}
            </span>
            <button onClick={() => eliminarTarea(tarea.id)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Fetch de Datos con Loading y Error

```jsx
function useFetch(url) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchDatos() {
      try {
        setCargando(true);
        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error('Error en la petición');
        const datos = await respuesta.json();
        setDatos(datos);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }
    
    fetchDatos();
  }, [url]);
  
  return { datos, cargando, error };
}

// Uso
function Post({ id }) {
  const { datos, cargando, error } = useFetch(
    `https://jsonplaceholder.typicode.com/posts/${id}`
  );
  
  if (cargando) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <article>
      <h2>{datos.title}</h2>
      <p>{datos.body}</p>
    </article>
  );
}
```

### Modal Reutilizable

```jsx
function Modal({ abierto, onCerrar, children }) {
  if (!abierto) return null;
  
  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-cerrar" onClick={onCerrar}>X</button>
        {children}
      </div>
    </div>
  );
}

// Uso
function App() {
  const [modalAbierto, setModalAbierto] = useState(false);
  
  return (
    <div>
      <button onClick={() => setModalAbierto(true)}>
        Abrir Modal
      </button>
      
      <Modal abierto={modalAbierto} onCerrar={() => setModalAbierto(false)}>
        <h2>Título del Modal</h2>
        <p>Contenido del modal...</p>
      </Modal>
    </div>
  );
}
```

---

## Mejores Prácticas

1. **Hooks en el nivel superior**: No llamar hooks dentro de condicionales, loops o funciones anidadas
2. **Dependencias correctas**: Incluir todas las variables usadas dentro del effect
3. **Props con tipos**: Usar TypeScript o PropTypes para validar props
4. **Componentes pequeños**: Dividir componentes grandes en otros más pequeños
5. **Evitar estado redundante**: No duplicar estado que puede derivarse
6. **Memoización selectiva**: No abusar de useMemo/useCallback

---

## Recursos Adicionales

- [Documentación oficial](https://react.dev)
- [React Hooks API](https://react.dev/reference/react)
- [Create React App](https://create-react-app.dev)
- [Vite](https://vitejs.dev)

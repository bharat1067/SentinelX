from typing import Callable, List, Dict, Any

class EventBus:
    def __init__(self):
        self._subscribers: List[Callable[[Dict[str, Any]], None]] = []
        self._buffer: List[Dict[str, Any]] = [] # Global timeline history
        self._session_buffers: Dict[str, List[Dict[str, Any]]] = {} # Session timeline

    def subscribe(self, callback: Callable[[Dict[str, Any]], None]) -> None:
        """
        Registers a callback listener to receive real-time streams of normalized logs.
        """
        if callback not in self._subscribers:
            self._subscribers.append(callback)

    def unsubscribe(self, callback: Callable[[Dict[str, Any]], None]) -> None:
        """
        Deregisters a listener callback.
        """
        if callback in self._subscribers:
            self._subscribers.remove(callback)

    def publish(self, event: Dict[str, Any]) -> None:
        """
        Ingests, archives, and broadcasts a normalized event to all subscribers.
        """
        self._buffer.append(event)
        
        session_id = event.get("session_id", "SES-GENERIC")
        if session_id not in self._session_buffers:
            self._session_buffers[session_id] = []
        self._session_buffers[session_id].append(event)

        # Broadcast to active listener threads
        for subscriber in self._subscribers:
            try:
                subscriber(event)
            except Exception as e:
                print(f"[EVENT-BUS][ERROR] Listener callback failed: {str(e)}")

    def get_history(self) -> List[Dict[str, Any]]:
        """
        Returns all archived events.
        """
        return self._buffer

    def get_session_history(self, session_id: str) -> List[Dict[str, Any]]:
        """
        Returns all archived events for a session.
        """
        return self._session_buffers.get(session_id, [])

    def clear(self) -> None:
        """
        Wipes active buffers.
        """
        self._buffer.clear()
        self._session_buffers.clear()

    def replay(self, session_id: str, playback_callback: Callable[[Dict[str, Any]], None]) -> None:
        """
        Replays recorded events for a given session.
        """
        events = self.get_session_history(session_id)
        print(f"[EVENT-BUS][REPLAY] Replaying {len(events)} events for session {session_id}...")
        for event in events:
            playback_callback(event)

global_event_bus = EventBus()

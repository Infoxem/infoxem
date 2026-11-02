import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch,MagicMock
import subprocess
import restart_worker as worker


class MonitoringTests(unittest.TestCase):
    def test_heartbeat_preserves_progress_and_publishes_complete_json(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch.object(worker,'OUT',Path(directory)),patch.object(worker,'STATE',{}):
                worker.update('collecting_batch',processed=15)
                worker.update(step_elapsed_seconds=30)
                state=json.loads((Path(directory)/'restart-worker-status.json').read_text())
                self.assertEqual(state['processed'],15)
                self.assertEqual(state['status'],'collecting_batch')
                self.assertEqual(state['step_elapsed_seconds'],30)
                self.assertFalse((Path(directory)/'restart-worker-status.pending.json').exists())

    def test_failed_collection_step_stops_run(self):
        child=MagicMock();child.wait.return_value=2
        with patch.object(worker,'update'),patch.object(worker.subprocess,'Popen') as launch:
            launch.return_value.__enter__.return_value=child
            with self.assertRaisesRegex(RuntimeError,'Worker step failed'):
                worker.call('python','run.py')

    def test_stalled_child_is_killed_before_worker_stops(self):
        child=MagicMock();child.wait.side_effect=[subprocess.TimeoutExpired('run.py',15),0]
        with patch.object(worker,'update'),patch.object(worker.subprocess,'Popen') as launch,patch.object(worker.time,'monotonic',side_effect=[0,901]):
            launch.return_value.__enter__.return_value=child
            with self.assertRaisesRegex(RuntimeError,'15 minutes'):
                worker.call('python','run.py')
            child.kill.assert_called_once()


if __name__=='__main__':unittest.main()

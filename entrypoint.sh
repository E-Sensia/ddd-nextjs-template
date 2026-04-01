#!/bin/sh

# Extract instance ID from ECS metadata (adapt for K8s if needed)
if [ -n "$ECS_CONTAINER_METADATA_URI_V4" ]; then
  TASK_ID=$(curl -s "$ECS_CONTAINER_METADATA_URI_V4/task" | jq -r ".TaskARN" | cut -d "/" -f 3)
  echo "Task ID: $TASK_ID"
  export OTEL_RESOURCE_ATTRIBUTES=$OTEL_RESOURCE_ATTRIBUTES,service.instance.id=$TASK_ID
fi

exec pnpm run start --port $PORT

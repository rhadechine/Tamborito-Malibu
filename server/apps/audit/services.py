from .models import AuditLog


def record(action, actor_user=None, organization="", entity_type="", entity_id=None, metadata=None):
    return AuditLog.objects.create(
        action=action,
        actor_user=actor_user,
        organization=organization,
        entity_type=entity_type,
        entity_id=entity_id,
        metadata=metadata or {},
    )

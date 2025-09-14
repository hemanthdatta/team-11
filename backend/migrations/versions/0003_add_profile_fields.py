"""Add profile fields to users table

Revision ID: 0003_add_profile_fields
Revises: previous_migration_id  # Replace with actual previous migration ID
Create Date: 2023-09-14

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0003_add_profile_fields'
down_revision = None  # Replace with actual previous migration ID
branch_labels = None
depends_on = None

def upgrade():
    # Add new columns to the users table
    op.add_column('users', sa.Column('business_name', sa.String(), nullable=True))
    op.add_column('users', sa.Column('business_type', sa.String(), nullable=True))
    op.add_column('users', sa.Column('location', sa.String(), nullable=True))
    op.add_column('users', sa.Column('bio', sa.String(), nullable=True))
    op.add_column('users', sa.Column('profile_image', sa.String(), nullable=True))
    op.add_column('users', sa.Column('website', sa.String(), nullable=True))

def downgrade():
    # Drop the newly added columns
    op.drop_column('users', 'website')
    op.drop_column('users', 'profile_image')
    op.drop_column('users', 'bio')
    op.drop_column('users', 'location')
    op.drop_column('users', 'business_type')
    op.drop_column('users', 'business_name')

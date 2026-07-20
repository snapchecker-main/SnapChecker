from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    full_name = Column(String(255), nullable=False)

    school_name = Column(String(255))
    department = Column(String(255))

    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    classrooms = relationship(
        "Classroom",
        back_populates="owner",
        cascade="all, delete-orphan",
    )


class Classroom(Base):
    __tablename__ = "classrooms"

    __table_args__ = (
        UniqueConstraint(
            "owner_id",
            "name",
            name="uq_owner_classroom_name",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    owner_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    name = Column(String(255), nullable=False)
    subject_name = Column(String(255), nullable=False)
    academic_term = Column(String(100))

    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship(
        "User",
        back_populates="classrooms",
    )

    masterlists = relationship(
        "Masterlist",
        back_populates="classroom",
        cascade="all, delete-orphan",
    )

    templates = relationship(
        "AnswerSheetTemplate",
        back_populates="classroom",
        cascade="all, delete-orphan",
    )


class AnswerSheetTemplate(Base):
    __tablename__ = "answer_sheet_templates"

    id = Column(Integer, primary_key=True, index=True)

    classroom_id = Column(
        Integer,
        ForeignKey(
            "classrooms.id",
            ondelete="CASCADE",
        ),
    )

    name = Column(String(255), nullable=False)
    exam_type = Column(String(100))
    test_directions = Column(Text)

    num_items = Column(Integer, nullable=False)
    num_choices = Column(Integer, nullable=False)

    answer_key_json = Column(JSON, default=list)
    layout_data = Column(JSON, nullable=True)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    classroom = relationship(
        "Classroom",
        back_populates="templates",
    )

    scan_results = relationship(
        "ScanResult",
        back_populates="template",
        cascade="all, delete-orphan",
    )


class Masterlist(Base):
    __tablename__ = "masterlists"

    id = Column(Integer, primary_key=True, index=True)

    classroom_id = Column(
        Integer,
        ForeignKey(
            "classrooms.id",
            ondelete="CASCADE",
        ),
    )

    student_name = Column(String(255), nullable=False)

    student_id = Column(String(50))

    created_at = Column(DateTime, default=datetime.utcnow)

    classroom = relationship(
        "Classroom",
        back_populates="masterlists",
    )


class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, index=True)

    template_id = Column(
        Integer,
        ForeignKey(
            "answer_sheet_templates.id",
            ondelete="CASCADE",
        ),
    )

    # Snapshotted Student Data
    raw_ocr_name = Column(String(255))
    matched_student_name = Column(String(255))
    raw_ocr_section = Column(String(100))
    detected_student_id = Column(String(50))

    # Grade Information
    score = Column(Integer, nullable=False)
    total_items = Column(Integer, nullable=False)

    student_answers_json = Column(JSON, default=list)
    item_results_json = Column(JSON, default=list)

    # Phase 5:
    # This will later become original_image_url once Cloudflare R2
    # is introduced. We intentionally leave it unchanged for now.
    original_image_url = Column(String, nullable=True)

    cloudinary_public_id = Column(String, nullable=True)

    annotations_json = Column(JSON, default=list)

    needs_review = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    template = relationship(
        "AnswerSheetTemplate",
        back_populates="scan_results",
    )
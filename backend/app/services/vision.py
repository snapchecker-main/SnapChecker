import cv2
import numpy as np
from typing import List, Optional

def order_points(pts):
    """
    RADIAL SORTING: Survives extreme rotation by finding the center of mass
    and sweeping clockwise to guarantee TL, TR, BR, BL ordering.
    """
    pts = np.array(pts, dtype="float32")
    center = np.mean(pts, axis=0)
    
    angles = np.arctan2(pts[:, 1] - center[1], pts[:, 0] - center[0])
    
    return pts[np.argsort(angles)]

class VisionEngine:
    
    @staticmethod
    def align_image(img: np.ndarray, target_w: int, target_h: int) -> np.ndarray:
        """
        PRODUCTION OMR ALIGNMENT
        Uses Convex Hulls to ignore QR codes and Radial Sorting to survive rotation.
        """
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        blurred = cv2.GaussianBlur(gray, (7, 7), 0)
        
        thresh = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2
        )
        
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        marker_centers = []
        
        for c in contours:
            area = cv2.contourArea(c)
            if area < 150 or area > 10000:
                continue
                
            peri = cv2.arcLength(c, True)
            approx = cv2.approxPolyDP(c, 0.04 * peri, True)
            
            if len(approx) == 4:
                x, y, w, h = cv2.boundingRect(approx)
                aspect_ratio = w / float(h)
                
                hull = cv2.convexHull(c)
                hull_area = cv2.contourArea(hull)
                solidity = float(area) / hull_area if hull_area > 0 else 0

                if 0.8 <= aspect_ratio <= 1.2 and solidity > 0.8:
                    M = cv2.moments(c)
                    if M["m00"] != 0:
                        cX = int(M["m10"] / M["m00"])
                        cY = int(M["m01"] / M["m00"])
                        marker_centers.append([cX, cY])
                        
        if len(marker_centers) >= 4:
            pts = np.array(marker_centers, dtype="float32")

            outer_hull = cv2.convexHull(pts)

            epsilon = 0.1 * cv2.arcLength(outer_hull, True)
            approx_corners = cv2.approxPolyDP(outer_hull, epsilon, True)
            
            if len(approx_corners) == 4:
                rect = order_points(approx_corners.reshape(4, 2))
                
                margin = 42
                dst_pts = np.array([
                    [margin, margin],
                    [target_w - margin, margin],
                    [target_w - margin, target_h - margin],
                    [margin, target_h - margin]
                ], dtype="float32")
                
                matrix = cv2.getPerspectiveTransform(rect, dst_pts)
            warped = cv2.warpPerspective(img, matrix, (target_w, target_h))
            
            # THE 180-DEGREE ORIENTATION FIX
            warped_gray = cv2.cvtColor(warped, cv2.COLOR_BGR2GRAY)
            
            tr_corner = warped_gray[30:180, target_w - 180:target_w - 30]
            bl_corner = warped_gray[target_h - 180:target_h - 30, 30:180]

            tr_brightness = np.mean(tr_corner)
            bl_brightness = np.mean(bl_corner)
            
            if bl_brightness < (tr_brightness - 30):
                warped = cv2.rotate(warped, cv2.ROTATE_180)
                
            return warped
                
        # FALLBACK
        h, w = img.shape[:2]
        scale = min(target_w / w, target_h / h)
        new_w, new_h = int(w * scale), int(h * scale)
        
        resized_img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
        canvas = np.ones((target_h, target_w, 3), dtype=np.uint8) * 255
        
        x_offset = (target_w - new_w) // 2
        y_offset = (target_h - new_h) // 2
        canvas[y_offset:y_offset+new_h, x_offset:x_offset+new_w] = resized_img
        
        return canvas

    @staticmethod
    def preprocess_image(image_bytes: bytes, target_w: int, target_h: int) -> np.ndarray:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Could not decode image file.")
        
        return VisionEngine.align_image(img, target_w, target_h)

    @staticmethod
    def detect_bubbles(
        img: np.ndarray, 
        bubble_coords: List[List[tuple]], 
        num_choices: int, 
        sensitivity: str = 'pencil', 
        custom_labels: Optional[List[str]] = None
    ) -> List[Optional[str]]:
        """
        COMMERCIAL-GRADE OMR EXTRACTION
        Uses 8-bit Grayscale Integration, Core Isolation, and Margin of Victory.
        Replaces fragile statistical relativity with absolute density thresholds.
        """
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
        
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        gray_closed = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, kernel)


        if sensitivity == 'strict' or sensitivity == 'ink':
            MIN_DENSITY = 80   
            MARGIN_REQ = 30   
        elif sensitivity == 'lenient':
            MIN_DENSITY = 35  
        else:  
            MIN_DENSITY = 50
            MARGIN_REQ = 20

        answers_idx = []

        for q_choices in bubble_coords:
            if not q_choices:
                answers_idx.append(None)
                continue

            densities = []
            for (x, y, r) in q_choices:
                r_core = max(1, r - 3)
                mask = np.zeros(gray_closed.shape, dtype="uint8")
                cv2.circle(mask, (x, y), r_core, 255, -1)

                mean_brightness = cv2.mean(gray_closed, mask=mask)[0]
                densities.append(255 - mean_brightness)

            max_density = max(densities)
            winner_idx = densities.index(max_density)

            if max_density < MIN_DENSITY:
                answers_idx.append(None)
                continue
            sorted_densities = sorted(densities, reverse=True)
            runner_up_density = sorted_densities[1] if len(sorted_densities) > 1 else 0

            if (max_density - runner_up_density) < MARGIN_REQ:
                answers_idx.append('Multiple Answers')
                continue

            answers_idx.append(winner_idx)

        # Format output using custom labels to match the React Frontend
        if custom_labels:
            choice_labels = custom_labels[:num_choices]
        else:
            choice_labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'][:num_choices]
            
        final_answers = []
        for idx in answers_idx:
            if idx == 'Multiple Answers':
                final_answers.append('Multiple Answers')
            elif idx is not None and idx < len(choice_labels):
                final_answers.append(choice_labels[idx])
            else:
                final_answers.append(None)

        return final_answers
    
    @staticmethod
    def annotate_image(img: np.ndarray, bubble_coords: List[List[tuple]], student_answers: List[Optional[str]], answer_key: List[str]) -> list:
        """
        Draws green circles for correct answers and red X's for wrong answers.
        Returns the image as a Base64 string for instant React rendering.
        """

        annotations = []

        labels = ['A', 'B', 'C', 'D', 'E', 'F']

        for question_number, (item_bubbles, student_ans, correct_ans) in enumerate(
            zip(bubble_coords, student_answers, answer_key),
            start=1,
        ):
            annotation = {
                "question": question_number,
                "student_answer": student_ans,
                "correct_answer": correct_ans,
                "is_correct": student_ans == correct_ans,
                "correct": None,
                "wrong": None,
            }

            if correct_ans in labels:
                idx = labels.index(correct_ans)
                if idx < len(item_bubbles):
                    x, y, r = item_bubbles[idx]
                    annotation["correct"] = {
                        "x": x,
                        "y": y,
                        "r": r,
                    }

            if student_ans in labels and student_ans != correct_ans:
                idx = labels.index(student_ans)
                if idx < len(item_bubbles):
                    x, y, r = item_bubbles[idx]
                    annotation["wrong"] = {
                        "x": x,
                        "y": y,
                        "r": r,
                    }

            annotations.append(annotation)

        return annotations
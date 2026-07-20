import math

class CoordinateGenerator:
    """
    Dynamically generates OMR coordinates by perfectly mirroring
    the Tailwind CSS grid layout rendered by React's html2canvas.
    """

    @staticmethod
    def roster_grid(layout_data: dict):
        roster_coords = []
        elements = layout_data.get("elements", [])
        id_block = next((el for el in elements if el.get("type") == "id_grid"), None)
        
        if not id_block:
            return []
            
        padding = 4
        start_x = id_block.get("x") + padding
        start_y = id_block.get("y") + padding
        digits = id_block.get("digits", 6)
        
        radius = 9 
        
        col_stride = 28 
        row_stride = 22 # Bubble h-[18px] + flex gap-1 (4px)
        
        # Center of the 20px column is at +10px
        first_bubble_center_x = start_x + 10
        
        # Y-Offset: h-5 (20px) + mb-1 (4px) + parent gap-1 (4px) = 28px to top of bubble
        first_bubble_center_y = start_y + 28 + radius

        for col in range(digits):
            column = []
            for row in range(10): 
                x = first_bubble_center_x + (col * col_stride)
                y = first_bubble_center_y + (row * row_stride)
                column.append((int(x), int(y), radius))
                
            roster_coords.append(column)
            
        return roster_coords

    @staticmethod
    def answer_grid(layout_data: dict, num_items: int, num_choices: int):
        bubble_coords = []
        elements = layout_data.get("elements", [])
        
        q_blocks = [el for el in elements if el.get("type") == "question_block"]
        q_blocks.sort(key=lambda b: b.get("start_q", 1))
        
        radius = 9
        row_stride = 26      # h-[18px] + gap-2 (8px)
        bubble_stride = 22   # w-[18px] + gap-1 (4px)
        
        mapped_questions = {}

        for block in q_blocks:
            padding = 4
            start_x = block.get("x") + padding
            start_y = block.get("y") + padding
            
            start_q = block.get("start_q")
            end_q = block.get("end_q")
            choices = block.get("choices", num_choices) 
            columns = block.get("columns", 1)
            col_gap = block.get("colGap", 0)
            
            total_items = max(1, end_q - start_q + 1)
            items_per_column = math.ceil(total_items / columns)
            
            # Number (20px) + gap-2 (8px) + bubbles + internal gaps
            col_width = 28 + (choices * 22) - 4
            
            for index, q_num in enumerate(range(start_q, end_q + 1)):
                col_index = index // items_per_column
                row_index = index % items_per_column
                
                q_choices = []
                
                current_col_start_x = start_x + (col_index * (col_width + col_gap))
                
                # base_x to first bubble center: w-5 (20px) + gap-2 (8px) + radius (9px) = 37px
                base_x = current_col_start_x + 37 
                base_y = start_y + (row_index * row_stride) + radius
                
                for c in range(choices):
                    bubble_x = base_x + (c * bubble_stride)
                    bubble_y = base_y
                    q_choices.append((int(bubble_x), int(bubble_y), radius))
                    
                mapped_questions[q_num] = q_choices

        for i in range(1, num_items + 1):
            if i in mapped_questions:
                bubble_coords.append(mapped_questions[i])
            else:
                bubble_coords.append([]) 

        return bubble_coords
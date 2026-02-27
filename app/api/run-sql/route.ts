import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"


export async function POST(request: Request) {
  try {
    const { sql } = await request.json()
    
    if (!sql) {
      return NextResponse.json({ error: "No SQL provided" }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Execute the SQL directly
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      console.error("SQL execution error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error running SQL:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

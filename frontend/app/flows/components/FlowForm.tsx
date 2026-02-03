'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const flowStepSchema = z.object({
  step_number: z.number().min(1, 'Step number is required'),
  email_subject: z.string().min(1, 'Subject is required'),
  email_content: z.string().min(1, 'Content is required'),
  delay_days: z.number().min(0, 'Delay must be 0 or greater').optional(),
})

const flowSchema = z.object({
  name: z.string().min(1, 'Flow name is required'),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
  steps: z.array(flowStepSchema).min(1, 'At least one step is required'),
})

export type FlowFormData = z.infer<typeof flowSchema>

interface FlowFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  initialData?: Partial<FlowFormData>
}

export function FlowForm({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: FlowFormProps) {
  const form = useForm<FlowFormData>({
    resolver: zodResolver(flowSchema),
    defaultValues: initialData ? {
      ...initialData,
      is_active: initialData.is_active ?? false,
    } : {
      name: '',
      description: '',
      is_active: false,
      steps: [
        {
          step_number: 1,
          email_subject: '',
          email_content: '',
          delay_days: 0,
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'steps',
  })

  const handleSubmit = async (data: FlowFormData) => {
    try {
      const response = await fetch('http://localhost:8000/api/flows/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (response.ok) {
        if (!initialData) {
          form.reset()
        }
        onSuccess?.()
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error creating flow:', error)
    }
  }

  const addStep = () => {
    const nextStepNumber = fields.length + 1
    append({
      step_number: nextStepNumber,
      email_subject: '',
      email_content: '',
      delay_days: 0,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Flow' : 'Create New Flow'}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? 'Update email flow steps below.'
              : 'Create a multi-step email sequence with delays between emails.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flow Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Welcome Series" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What is this flow for?"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Flow</FormLabel>
                    <FormDescription>
                      Enable this flow to send emails automatically
                    </FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Email Sequence</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addStep}
                >
                  Add Email Step
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Step {field.step_number}</CardTitle>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`steps.${index}.step_number`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Step Number</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`steps.${index}.email_subject`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Subject *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Welcome to our store!"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`steps.${index}.email_content`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Content *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Hi {{first_name}}, we're excited to have you..."
                              className="resize-none h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`steps.${index}.delay_days`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Delay Before This Email (Days)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              min="0"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {field.delay_days && field.delay_days > 0 && (
                      <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                        Wait {field.delay_days} day{field.delay_days !== 1 ? 's' : ''} before sending this email
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : initialData ? 'Update Flow' : 'Create Flow'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
